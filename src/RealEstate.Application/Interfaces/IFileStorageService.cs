using RealEstate.Application.DTOs.PropertyImages;

namespace RealEstate.Application.Interfaces;

public interface IFileStorageService
{
    Task<string> SavePropertyImageAsync(FileUploadData file, CancellationToken cancellationToken = default);
    Task DeleteAsync(string imageUrl, CancellationToken cancellationToken = default);
}
