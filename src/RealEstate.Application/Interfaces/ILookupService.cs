using RealEstate.Application.DTOs.Lookups;

namespace RealEstate.Application.Interfaces;

public interface ILookupService
{
    Task<IReadOnlyList<LookupItemResponse>> GetCitiesAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<LookupItemResponse>> GetAreasAsync(int? cityId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<LookupItemResponse>> GetAmenitiesAsync(CancellationToken cancellationToken = default);
}
