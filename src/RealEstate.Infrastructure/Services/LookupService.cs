using Microsoft.EntityFrameworkCore;
using RealEstate.Application.DTOs.Lookups;
using RealEstate.Application.Interfaces;
using RealEstate.Infrastructure.Persistence;

namespace RealEstate.Infrastructure.Services;

public class LookupService : ILookupService
{
    private readonly RealEstateDbContext _dbContext;

    public LookupService(RealEstateDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyList<LookupItemResponse>> GetCitiesAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.Cities
            .AsNoTracking()
            .OrderBy(x => x.Name)
            .Select(x => new LookupItemResponse
            {
                Id = x.Id,
                Name = x.Name
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<LookupItemResponse>> GetAreasAsync(int? cityId, CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Areas.AsNoTracking();

        if (cityId.HasValue)
        {
            query = query.Where(x => x.CityId == cityId.Value);
        }

        return await query
            .OrderBy(x => x.Name)
            .Select(x => new LookupItemResponse
            {
                Id = x.Id,
                Name = x.Name
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<LookupItemResponse>> GetAmenitiesAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.Amenities
            .AsNoTracking()
            .OrderBy(x => x.Name)
            .Select(x => new LookupItemResponse
            {
                Id = x.Id,
                Name = x.Name
            })
            .ToListAsync(cancellationToken);
    }
}
