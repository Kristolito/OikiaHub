using FluentValidation;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.DTOs.Common;
using RealEstate.Application.DTOs.Properties;
using RealEstate.Application.Exceptions;
using RealEstate.Application.Interfaces;
using RealEstate.Domain.Entities;
using RealEstate.Domain.Enums;
using RealEstate.Infrastructure.Persistence;

namespace RealEstate.Infrastructure.Services;

public class PropertyService : IPropertyService
{
    private readonly RealEstateDbContext _dbContext;
    private readonly IValidator<GetPropertiesRequest> _getValidator;
    private readonly IValidator<CreatePropertyRequest> _createValidator;
    private readonly IValidator<UpdatePropertyRequest> _updateValidator;

    public PropertyService(
        RealEstateDbContext dbContext,
        IValidator<GetPropertiesRequest> getValidator,
        IValidator<CreatePropertyRequest> createValidator,
        IValidator<UpdatePropertyRequest> updateValidator)
    {
        _dbContext = dbContext;
        _getValidator = getValidator;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    public async Task<PagedResponse<PropertyListItemResponse>> GetPropertiesAsync(GetPropertiesRequest request, CancellationToken cancellationToken = default)
    {
        await _getValidator.ValidateAndThrowAsync(request, cancellationToken);
        await ValidateFilterConsistencyAsync(request, cancellationToken);

        var page = request.Page;
        var pageSize = request.PageSize;
        var sortBy = (request.SortBy ?? "newest").Trim().ToLowerInvariant();

        IQueryable<Property> query = _dbContext.Properties.AsNoTracking()
            .Where(x => x.Status == PropertyStatus.Published);

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var term = request.SearchTerm.Trim();
            query = query.Where(x =>
                x.Title.Contains(term) ||
                x.Description.Contains(term) ||
                x.Address.Contains(term));
        }

        if (request.CityId.HasValue)
        {
            query = query.Where(x => x.CityId == request.CityId.Value);
        }

        if (request.AreaId.HasValue)
        {
            query = query.Where(x => x.AreaId == request.AreaId.Value);
        }

        if (request.ListingType.HasValue)
        {
            query = query.Where(x => x.ListingType == request.ListingType.Value);
        }

        if (request.PropertyType.HasValue)
        {
            query = query.Where(x => x.PropertyType == request.PropertyType.Value);
        }

        if (request.MinPrice.HasValue)
        {
            query = query.Where(x => x.Price >= request.MinPrice.Value);
        }

        if (request.MaxPrice.HasValue)
        {
            query = query.Where(x => x.Price <= request.MaxPrice.Value);
        }

        if (request.MinBedrooms.HasValue)
        {
            query = query.Where(x => x.Bedrooms >= request.MinBedrooms.Value);
        }

        if (request.MaxBedrooms.HasValue)
        {
            query = query.Where(x => x.Bedrooms <= request.MaxBedrooms.Value);
        }

        if (request.MinBathrooms.HasValue)
        {
            query = query.Where(x => x.Bathrooms >= request.MinBathrooms.Value);
        }

        if (request.MaxBathrooms.HasValue)
        {
            query = query.Where(x => x.Bathrooms <= request.MaxBathrooms.Value);
        }

        if (request.MinSquareMeters.HasValue)
        {
            query = query.Where(x => x.SquareMeters >= request.MinSquareMeters.Value);
        }

        if (request.MaxSquareMeters.HasValue)
        {
            query = query.Where(x => x.SquareMeters <= request.MaxSquareMeters.Value);
        }

        if (request.Status.HasValue)
        {
            query = query.Where(x => x.Status == request.Status.Value);
        }

        query = sortBy switch
        {
            "oldest" => query.OrderBy(x => x.CreatedAt),
            "priceasc" => query.OrderBy(x => x.Price),
            "pricedesc" => query.OrderByDescending(x => x.Price),
            _ => query.OrderByDescending(x => x.CreatedAt)
        };

        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new PropertyListItemResponse
            {
                Id = x.Id,
                Title = x.Title,
                Price = x.Price,
                City = x.City.Name,
                Area = x.Area.Name,
                Bedrooms = x.Bedrooms,
                Bathrooms = x.Bathrooms,
                SquareMeters = x.SquareMeters,
                ListingType = x.ListingType,
                PropertyType = x.PropertyType,
                PrimaryImageUrl = x.PropertyImages
                    .OrderByDescending(i => i.IsPrimary)
                    .ThenBy(i => i.SortOrder)
                    .Select(i => i.ImageUrl)
                    .FirstOrDefault(),
                CreatedAt = x.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return new PagedResponse<PropertyListItemResponse>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = total,
            TotalPages = (int)Math.Ceiling(total / (double)pageSize)
        };
    }

    public async Task<PropertyDetailsResponse?> GetPropertyByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var property = await GetPropertyQuery()
            .AsNoTracking()
            .Where(x => x.Status == PropertyStatus.Published)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        return property is null ? null : MapDetails(property);
    }

    public async Task<PropertyDetailsResponse> CreatePropertyAsync(CreatePropertyRequest request, int actorUserId, string actorRole, CancellationToken cancellationToken = default)
    {
        await _createValidator.ValidateAndThrowAsync(request, cancellationToken);
        await ValidateLocationAndAmenitiesAsync(request.CityId, request.AreaId, request.AmenityIds, cancellationToken);

        var agentProfileId = await ResolveAgentProfileIdForWriteAsync(
            actorUserId,
            actorRole,
            request.AgentProfileId,
            cancellationToken);

        var property = new Property
        {
            Title = request.Title.Trim(),
            Description = request.Description.Trim(),
            Price = request.Price,
            PropertyType = request.PropertyType,
            ListingType = request.ListingType,
            Bedrooms = request.Bedrooms,
            Bathrooms = request.Bathrooms,
            SquareMeters = request.SquareMeters,
            Address = request.Address.Trim(),
            PostalCode = request.PostalCode?.Trim(),
            CityId = request.CityId,
            AreaId = request.AreaId,
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            YearBuilt = request.YearBuilt,
            Floor = request.Floor,
            Status = request.Status,
            AgentProfileId = agentProfileId
        };

        ApplyAmenities(property, request.AmenityIds);
        ApplyImages(property, request.ImageUrls, request.PrimaryImageUrl);

        _dbContext.Properties.Add(property);
        await _dbContext.SaveChangesAsync(cancellationToken);

        var created = await GetPropertyQuery().FirstAsync(x => x.Id == property.Id, cancellationToken);
        return MapDetails(created);
    }

    public async Task<PropertyDetailsResponse> UpdatePropertyAsync(int id, UpdatePropertyRequest request, int actorUserId, string actorRole, CancellationToken cancellationToken = default)
    {
        await _updateValidator.ValidateAndThrowAsync(request, cancellationToken);
        await ValidateLocationAndAmenitiesAsync(request.CityId, request.AreaId, request.AmenityIds, cancellationToken);

        var property = await GetPropertyQuery()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (property is null)
        {
            throw new NotFoundException("Property not found.");
        }

        await EnsureCanManageAsync(property, actorUserId, actorRole, cancellationToken);

        if (actorRole.Equals("Admin", StringComparison.OrdinalIgnoreCase) && request.AgentProfileId.HasValue)
        {
            var targetAgentExists = await _dbContext.AgentProfiles.AnyAsync(x => x.Id == request.AgentProfileId.Value, cancellationToken);
            if (!targetAgentExists)
            {
                throw new BadRequestException("Selected agent profile does not exist.");
            }

            property.AgentProfileId = request.AgentProfileId.Value;
        }

        property.Title = request.Title.Trim();
        property.Description = request.Description.Trim();
        property.Price = request.Price;
        property.PropertyType = request.PropertyType;
        property.ListingType = request.ListingType;
        property.Bedrooms = request.Bedrooms;
        property.Bathrooms = request.Bathrooms;
        property.SquareMeters = request.SquareMeters;
        property.Address = request.Address.Trim();
        property.PostalCode = request.PostalCode?.Trim();
        property.CityId = request.CityId;
        property.AreaId = request.AreaId;
        property.Latitude = request.Latitude;
        property.Longitude = request.Longitude;
        property.YearBuilt = request.YearBuilt;
        property.Floor = request.Floor;
        property.Status = request.Status;

        property.PropertyAmenities.Clear();
        ApplyAmenities(property, request.AmenityIds);

        if (request.ImageUrls.Count > 0 || !string.IsNullOrWhiteSpace(request.PrimaryImageUrl))
        {
            _dbContext.PropertyImages.RemoveRange(property.PropertyImages);
            property.PropertyImages.Clear();
            ApplyImages(property, request.ImageUrls, request.PrimaryImageUrl);
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
        return MapDetails(property);
    }

    public async Task DeletePropertyAsync(int id, int actorUserId, string actorRole, CancellationToken cancellationToken = default)
    {
        var property = await _dbContext.Properties
            .Include(x => x.AgentProfile)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (property is null)
        {
            throw new NotFoundException("Property not found.");
        }

        await EnsureCanManageAsync(property, actorUserId, actorRole, cancellationToken);

        _dbContext.Properties.Remove(property);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsureCanManageAsync(Property property, int actorUserId, string actorRole, CancellationToken cancellationToken)
    {
        if (actorRole.Equals("Admin", StringComparison.OrdinalIgnoreCase))
        {
            return;
        }

        if (!actorRole.Equals("Agent", StringComparison.OrdinalIgnoreCase))
        {
            throw new ForbiddenException("You are not allowed to manage properties.");
        }

        var ownerUserId = property.AgentProfile.UserId;
        if (ownerUserId == 0)
        {
            ownerUserId = await _dbContext.AgentProfiles
                .Where(x => x.Id == property.AgentProfileId)
                .Select(x => x.UserId)
                .FirstAsync(cancellationToken);
        }

        if (ownerUserId != actorUserId)
        {
            throw new ForbiddenException("You can only manage your own properties.");
        }
    }

    private async Task<int> ResolveAgentProfileIdForWriteAsync(int actorUserId, string actorRole, int? requestedAgentProfileId, CancellationToken cancellationToken)
    {
        if (actorRole.Equals("Agent", StringComparison.OrdinalIgnoreCase))
        {
            var agentProfileId = await _dbContext.AgentProfiles
                .Where(x => x.UserId == actorUserId)
                .Select(x => x.Id)
                .FirstOrDefaultAsync(cancellationToken);

            if (agentProfileId == 0)
            {
                throw new ForbiddenException("Agent profile is required to create properties.");
            }

            return agentProfileId;
        }

        if (actorRole.Equals("Admin", StringComparison.OrdinalIgnoreCase))
        {
            if (!requestedAgentProfileId.HasValue)
            {
                throw new BadRequestException("AgentProfileId is required for admin property creation.");
            }

            var exists = await _dbContext.AgentProfiles.AnyAsync(x => x.Id == requestedAgentProfileId.Value, cancellationToken);
            if (!exists)
            {
                throw new BadRequestException("Selected agent profile does not exist.");
            }

            return requestedAgentProfileId.Value;
        }

        throw new ForbiddenException("You are not allowed to create properties.");
    }

    private async Task ValidateLocationAndAmenitiesAsync(int cityId, int areaId, IEnumerable<int> amenityIds, CancellationToken cancellationToken)
    {
        var cityExists = await _dbContext.Cities.AnyAsync(x => x.Id == cityId, cancellationToken);
        if (!cityExists)
        {
            throw new BadRequestException("Selected city is invalid.");
        }

        var area = await _dbContext.Areas.FirstOrDefaultAsync(x => x.Id == areaId, cancellationToken);
        if (area is null)
        {
            throw new BadRequestException("Selected area is invalid.");
        }

        if (area.CityId != cityId)
        {
            throw new BadRequestException("Selected area does not belong to selected city.");
        }

        var distinctAmenityIds = amenityIds.Where(x => x > 0).Distinct().ToList();
        if (distinctAmenityIds.Count == 0)
        {
            return;
        }

        var existingAmenityIds = await _dbContext.Amenities
            .Where(x => distinctAmenityIds.Contains(x.Id))
            .Select(x => x.Id)
            .ToListAsync(cancellationToken);

        if (existingAmenityIds.Count != distinctAmenityIds.Count)
        {
            throw new BadRequestException("One or more amenity IDs are invalid.");
        }
    }

    private async Task ValidateFilterConsistencyAsync(GetPropertiesRequest request, CancellationToken cancellationToken)
    {
        if (request.CityId.HasValue && request.AreaId.HasValue)
        {
            var area = await _dbContext.Areas
                .AsNoTracking()
                .Where(x => x.Id == request.AreaId.Value)
                .Select(x => new { x.Id, x.CityId })
                .FirstOrDefaultAsync(cancellationToken);

            if (area is null)
            {
                throw new BadRequestException("Selected area is invalid.");
            }

            if (area.CityId != request.CityId.Value)
            {
                throw new BadRequestException("Selected area does not belong to selected city.");
            }
        }
    }

    private static void ApplyAmenities(Property property, IEnumerable<int> amenityIds)
    {
        foreach (var amenityId in amenityIds.Where(x => x > 0).Distinct())
        {
            property.PropertyAmenities.Add(new PropertyAmenity
            {
                AmenityId = amenityId,
                Property = property
            });
        }
    }

    private static void ApplyImages(Property property, IReadOnlyCollection<string> imageUrls, string? primaryImageUrl)
    {
        var cleanedUrls = imageUrls
            .Select(x => x.Trim())
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        if (!string.IsNullOrWhiteSpace(primaryImageUrl))
        {
            var normalizedPrimary = primaryImageUrl.Trim();
            if (!cleanedUrls.Contains(normalizedPrimary, StringComparer.OrdinalIgnoreCase))
            {
                cleanedUrls.Insert(0, normalizedPrimary);
            }
        }

        for (var i = 0; i < cleanedUrls.Count; i++)
        {
            var url = cleanedUrls[i];
            var isPrimary = !string.IsNullOrWhiteSpace(primaryImageUrl)
                ? url.Equals(primaryImageUrl.Trim(), StringComparison.OrdinalIgnoreCase)
                : i == 0;

            property.PropertyImages.Add(new PropertyImage
            {
                ImageUrl = url,
                IsPrimary = isPrimary,
                SortOrder = i
            });
        }
    }

    private IQueryable<Property> GetPropertyQuery()
    {
        return _dbContext.Properties
            .Include(x => x.City)
            .Include(x => x.Area)
            .Include(x => x.AgentProfile)
                .ThenInclude(x => x.User)
            .Include(x => x.PropertyImages)
            .Include(x => x.PropertyAmenities)
                .ThenInclude(x => x.Amenity);
    }

    private static PropertyDetailsResponse MapDetails(Property property)
    {
        return new PropertyDetailsResponse
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
            Agent = new AgentBasicResponse
            {
                Id = property.AgentProfile.Id,
                UserId = property.AgentProfile.UserId,
                FirstName = property.AgentProfile.User.FirstName,
                LastName = property.AgentProfile.User.LastName,
                Email = property.AgentProfile.User.Email,
                PhoneNumber = property.AgentProfile.PhoneNumber,
                AgencyName = property.AgentProfile.AgencyName,
                ProfileImageUrl = property.AgentProfile.ProfileImageUrl
            },
            Images = property.PropertyImages
                .OrderByDescending(x => x.IsPrimary)
                .ThenBy(x => x.SortOrder)
                .Select(x => new PropertyImageResponse
                {
                    Id = x.Id,
                    ImageUrl = x.ImageUrl,
                    IsPrimary = x.IsPrimary,
                    SortOrder = x.SortOrder
                })
                .ToList(),
            Amenities = property.PropertyAmenities
                .Select(x => new AmenityResponse
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
