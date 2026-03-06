using RealEstate.Application.DTOs.Common;
using RealEstate.Application.DTOs.Properties;

namespace RealEstate.Application.Interfaces;

public interface IPropertyService
{
    Task<PagedResponse<PropertyListItemResponse>> GetPropertiesAsync(GetPropertiesRequest request, CancellationToken cancellationToken = default);
    Task<PropertyDetailsResponse?> GetPropertyByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<PropertyDetailsResponse> CreatePropertyAsync(CreatePropertyRequest request, int actorUserId, string actorRole, CancellationToken cancellationToken = default);
    Task<PropertyDetailsResponse> UpdatePropertyAsync(int id, UpdatePropertyRequest request, int actorUserId, string actorRole, CancellationToken cancellationToken = default);
    Task DeletePropertyAsync(int id, int actorUserId, string actorRole, CancellationToken cancellationToken = default);
}
