using Microsoft.EntityFrameworkCore;
using RealEstate.Application.DTOs.Agents;
using RealEstate.Application.Interfaces;
using RealEstate.Domain.Enums;
using RealEstate.Infrastructure.Persistence;

namespace RealEstate.Infrastructure.Services;

public class AgentService : IAgentService
{
    private readonly RealEstateDbContext _dbContext;

    public AgentService(RealEstateDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<AgentProfileResponse?> GetAgentProfileAsync(int agentProfileId, CancellationToken cancellationToken = default)
    {
        var agent = await _dbContext.AgentProfiles
            .AsNoTracking()
            .Where(x => x.Id == agentProfileId)
            .Select(x => new AgentProfileResponse
            {
                Id = x.Id,
                UserId = x.UserId,
                FirstName = x.User.FirstName,
                LastName = x.User.LastName,
                Email = x.User.Email,
                PhoneNumber = x.PhoneNumber,
                AgencyName = x.AgencyName,
                Bio = x.Bio,
                ProfileImageUrl = x.ProfileImageUrl,
                PublishedPropertyCount = x.Properties.Count(p => p.Status == PropertyStatus.Published),
                Properties = x.Properties
                    .Where(p => p.Status == PropertyStatus.Published)
                    .OrderByDescending(p => p.CreatedAt)
                    .Take(12)
                    .Select(p => new AgentPropertyListItemResponse
                    {
                        Id = p.Id,
                        Title = p.Title,
                        Price = p.Price,
                        City = p.City.Name,
                        Area = p.Area.Name,
                        Bedrooms = p.Bedrooms,
                        Bathrooms = p.Bathrooms,
                        SquareMeters = p.SquareMeters,
                        ListingType = p.ListingType,
                        PropertyType = p.PropertyType,
                        PrimaryImageUrl = p.PropertyImages
                            .OrderByDescending(i => i.IsPrimary)
                            .ThenBy(i => i.SortOrder)
                            .Select(i => i.ImageUrl)
                            .FirstOrDefault()
                    })
                    .ToList()
            })
            .FirstOrDefaultAsync(cancellationToken);

        return agent;
    }
}
