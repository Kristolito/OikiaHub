using RealEstate.Application.DTOs.Favorites;

namespace RealEstate.Application.Interfaces;

public interface IFavoriteService
{
    Task<FavoriteStatusResponse> AddAsync(int userId, AddFavoriteRequest request, CancellationToken cancellationToken = default);
    Task RemoveAsync(int userId, int propertyId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<FavoriteItemResponse>> GetMineAsync(int userId, CancellationToken cancellationToken = default);
    Task<FavoriteStatusResponse> CheckAsync(int userId, int propertyId, CancellationToken cancellationToken = default);
}
