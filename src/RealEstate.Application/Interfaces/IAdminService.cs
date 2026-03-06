using RealEstate.Application.DTOs.Admin;

namespace RealEstate.Application.Interfaces;

public interface IAdminService
{
    Task<AdminDashboardResponse> GetDashboardAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<AdminUserListItemResponse>> GetUsersAsync(CancellationToken cancellationToken = default);
    Task<AdminUserDetailsResponse> GetUserByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<AdminPropertyListItemResponse>> GetPropertiesAsync(CancellationToken cancellationToken = default);
    Task<AdminPropertyDetailsResponse> GetPropertyByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<AdminPropertyDetailsResponse> UpdatePropertyStatusAsync(int id, UpdatePropertyStatusRequest request, CancellationToken cancellationToken = default);
    Task DeletePropertyAsync(int id, CancellationToken cancellationToken = default);
}
