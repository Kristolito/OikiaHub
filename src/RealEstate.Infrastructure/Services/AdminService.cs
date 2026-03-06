using FluentValidation;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.DTOs.Admin;
using RealEstate.Application.Exceptions;
using RealEstate.Application.Interfaces;
using RealEstate.Domain.Entities;
using RealEstate.Infrastructure.Persistence;

namespace RealEstate.Infrastructure.Services;

public class AdminService : IAdminService
{
    private readonly RealEstateDbContext _dbContext;
    private readonly IValidator<UpdatePropertyStatusRequest> _statusValidator;
    private readonly IFileStorageService _fileStorageService;

    public AdminService(
        RealEstateDbContext dbContext,
        IValidator<UpdatePropertyStatusRequest> statusValidator,
        IFileStorageService fileStorageService)
    {
        _dbContext = dbContext;
        _statusValidator = statusValidator;
        _fileStorageService = fileStorageService;
    }

    public async Task<AdminDashboardResponse> GetDashboardAsync(CancellationToken cancellationToken = default)
    {
        var recentThreshold = DateTime.UtcNow.AddDays(-30);
        var agentRoleId = await _dbContext.Roles
            .AsNoTracking()
            .Where(x => x.Name == "Agent")
            .Select(x => (int?)x.Id)
            .FirstOrDefaultAsync(cancellationToken);

        return new AdminDashboardResponse
        {
            TotalUsers = await _dbContext.Users.AsNoTracking().CountAsync(cancellationToken),
            TotalAgents = agentRoleId.HasValue
                ? await _dbContext.Users.AsNoTracking().CountAsync(x => x.RoleId == agentRoleId.Value, cancellationToken)
                : 0,
            TotalProperties = await _dbContext.Properties.AsNoTracking().CountAsync(cancellationToken),
            TotalPublishedProperties = await _dbContext.Properties.AsNoTracking().CountAsync(x => x.Status == Domain.Enums.PropertyStatus.Published, cancellationToken),
            TotalDraftProperties = await _dbContext.Properties.AsNoTracking().CountAsync(x => x.Status == Domain.Enums.PropertyStatus.Draft, cancellationToken),
            TotalSoldProperties = await _dbContext.Properties.AsNoTracking().CountAsync(x => x.Status == Domain.Enums.PropertyStatus.Sold, cancellationToken),
            TotalInquiries = await _dbContext.Inquiries.AsNoTracking().CountAsync(cancellationToken),
            RecentUsersCount = await _dbContext.Users.AsNoTracking().CountAsync(x => x.CreatedAt >= recentThreshold, cancellationToken),
            RecentPropertiesCount = await _dbContext.Properties.AsNoTracking().CountAsync(x => x.CreatedAt >= recentThreshold, cancellationToken)
        };
    }

    public async Task<IReadOnlyList<AdminUserListItemResponse>> GetUsersAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.Users
            .AsNoTracking()
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new AdminUserListItemResponse
            {
                Id = x.Id,
                FirstName = x.FirstName,
                LastName = x.LastName,
                Email = x.Email,
                Role = x.Role.Name,
                CreatedAt = x.CreatedAt
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<AdminUserDetailsResponse> GetUserByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var user = await _dbContext.Users
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => new
            {
                x.Id,
                x.FirstName,
                x.LastName,
                x.Email,
                Role = x.Role.Name,
                x.CreatedAt,
                AgentProfile = x.AgentProfile == null
                    ? null
                    : new
                    {
                        x.AgentProfile.Id,
                        x.AgentProfile.PhoneNumber,
                        x.AgentProfile.AgencyName,
                        x.AgentProfile.Bio,
                        x.AgentProfile.ProfileImageUrl
                    }
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (user is null)
        {
            throw new NotFoundException("User not found.");
        }

        var propertyCount = 0;
        if (user.AgentProfile is not null)
        {
            propertyCount = await _dbContext.Properties
                .AsNoTracking()
                .CountAsync(x => x.AgentProfileId == user.AgentProfile.Id, cancellationToken);
        }

        var inquiryCount = await _dbContext.Inquiries
            .AsNoTracking()
            .CountAsync(x => x.UserId == user.Id, cancellationToken);

        return new AdminUserDetailsResponse
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            Role = user.Role,
            CreatedAt = user.CreatedAt,
            AgentProfile = user.AgentProfile is null
                ? null
                : new AdminAgentProfileResponse
                {
                    Id = user.AgentProfile.Id,
                    PhoneNumber = user.AgentProfile.PhoneNumber,
                    AgencyName = user.AgentProfile.AgencyName,
                    Bio = user.AgentProfile.Bio,
                    ProfileImageUrl = user.AgentProfile.ProfileImageUrl
                },
            PropertyCount = propertyCount,
            InquiryCount = inquiryCount
        };
    }

    public async Task<IReadOnlyList<AdminPropertyListItemResponse>> GetPropertiesAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.Properties
            .AsNoTracking()
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new AdminPropertyListItemResponse
            {
                Id = x.Id,
                Title = x.Title,
                Price = x.Price,
                AgentName = x.AgentProfile.User.FirstName + " " + x.AgentProfile.User.LastName,
                AgentEmail = x.AgentProfile.User.Email,
                City = x.City.Name,
                Area = x.Area.Name,
                Status = x.Status,
                CreatedAt = x.CreatedAt
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<AdminPropertyDetailsResponse> GetPropertyByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var property = await _dbContext.Properties
            .AsNoTracking()
            .Include(x => x.City)
            .Include(x => x.Area)
            .Include(x => x.AgentProfile)
                .ThenInclude(x => x.User)
            .Include(x => x.PropertyImages)
            .Include(x => x.PropertyAmenities)
                .ThenInclude(x => x.Amenity)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (property is null)
        {
            throw new NotFoundException("Property not found.");
        }

        return MapDetails(property);
    }

    public async Task<AdminPropertyDetailsResponse> UpdatePropertyStatusAsync(
        int id,
        UpdatePropertyStatusRequest request,
        CancellationToken cancellationToken = default)
    {
        await _statusValidator.ValidateAndThrowAsync(request, cancellationToken);

        var property = await _dbContext.Properties
            .Include(x => x.City)
            .Include(x => x.Area)
            .Include(x => x.AgentProfile)
                .ThenInclude(x => x.User)
            .Include(x => x.PropertyImages)
            .Include(x => x.PropertyAmenities)
                .ThenInclude(x => x.Amenity)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (property is null)
        {
            throw new NotFoundException("Property not found.");
        }

        property.Status = request.Status;
        property.UpdatedAt = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync(cancellationToken);

        return MapDetails(property);
    }

    public async Task DeletePropertyAsync(int id, CancellationToken cancellationToken = default)
    {
        var property = await _dbContext.Properties
            .Include(x => x.PropertyImages)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (property is null)
        {
            throw new NotFoundException("Property not found.");
        }

        var imageUrls = property.PropertyImages.Select(x => x.ImageUrl).ToList();
        _dbContext.Properties.Remove(property);
        await _dbContext.SaveChangesAsync(cancellationToken);

        foreach (var imageUrl in imageUrls)
        {
            await _fileStorageService.DeleteAsync(imageUrl, cancellationToken);
        }
    }

    private static AdminPropertyDetailsResponse MapDetails(Property property)
    {
        return new AdminPropertyDetailsResponse
        {
            Id = property.Id,
            Title = property.Title,
            Description = property.Description,
            Price = property.Price,
            PropertyType = property.PropertyType,
            ListingType = property.ListingType,
            Bedrooms = property.Bedrooms,
            Bathrooms = property.Bathrooms,
            SquareMeters = property.SquareMeters,
            Address = property.Address,
            PostalCode = property.PostalCode,
            CityId = property.CityId,
            City = property.City.Name,
            AreaId = property.AreaId,
            Area = property.Area.Name,
            Latitude = property.Latitude,
            Longitude = property.Longitude,
            YearBuilt = property.YearBuilt,
            Floor = property.Floor,
            Status = property.Status,
            AgentProfileId = property.AgentProfileId,
            Agent = new AdminPropertyAgentResponse
            {
                AgentProfileId = property.AgentProfile.Id,
                UserId = property.AgentProfile.UserId,
                FirstName = property.AgentProfile.User.FirstName,
                LastName = property.AgentProfile.User.LastName,
                Email = property.AgentProfile.User.Email,
                PhoneNumber = property.AgentProfile.PhoneNumber,
                AgencyName = property.AgentProfile.AgencyName
            },
            Images = property.PropertyImages
                .OrderByDescending(x => x.IsPrimary)
                .ThenBy(x => x.SortOrder)
                .Select(x => new AdminPropertyImageResponse
                {
                    Id = x.Id,
                    ImageUrl = x.ImageUrl,
                    IsPrimary = x.IsPrimary,
                    SortOrder = x.SortOrder
                })
                .ToList(),
            Amenities = property.PropertyAmenities
                .Select(x => new AdminPropertyAmenityResponse
                {
                    Id = x.AmenityId,
                    Name = x.Amenity.Name
                })
                .OrderBy(x => x.Name)
                .ToList(),
            CreatedAt = property.CreatedAt,
            UpdatedAt = property.UpdatedAt
        };
    }
}
