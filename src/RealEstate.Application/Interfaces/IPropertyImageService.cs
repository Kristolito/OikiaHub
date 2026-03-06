using RealEstate.Application.DTOs.PropertyImages;

namespace RealEstate.Application.Interfaces;

public interface IPropertyImageService
{
    Task<IReadOnlyList<PropertyImageItemResponse>> UploadAsync(
        int propertyId,
        IReadOnlyList<FileUploadData> files,
        int actorUserId,
        string actorRole,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<PropertyImageItemResponse>> GetByPropertyAsync(
        int propertyId,
        int? actorUserId,
        string? actorRole,
        CancellationToken cancellationToken = default);

    Task DeleteAsync(
        int propertyId,
        int imageId,
        int actorUserId,
        string actorRole,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<PropertyImageItemResponse>> SetPrimaryAsync(
        int propertyId,
        int imageId,
        int actorUserId,
        string actorRole,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<PropertyImageItemResponse>> ReorderAsync(
        int propertyId,
        ReorderPropertyImagesRequest request,
        int actorUserId,
        string actorRole,
        CancellationToken cancellationToken = default);
}
