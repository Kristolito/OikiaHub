using RealEstate.Application.DTOs.PropertyImages;
using RealEstate.Application.Exceptions;
using RealEstate.Application.Interfaces;

namespace RealEstate.Infrastructure.Services;

public class LocalFileStorageService : IFileStorageService
{
    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".jpg",
        ".jpeg",
        ".png",
        ".webp"
    };

    private const long MaxFileSizeBytes = 5 * 1024 * 1024;
    private const string UploadFolder = "uploads/properties";
    private readonly string _webRootPath;
    private readonly string _uploadPath;
    private readonly string _uploadPathFull;

    public LocalFileStorageService()
    {
        _webRootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        _uploadPath = Path.Combine(_webRootPath, "uploads", "properties");
        _uploadPathFull = Path.GetFullPath(_uploadPath);
        Directory.CreateDirectory(_uploadPath);
    }

    public async Task<string> SavePropertyImageAsync(FileUploadData file, CancellationToken cancellationToken = default)
    {
        if (file.Content.Length == 0)
        {
            throw new BadRequestException("Uploaded file is empty.");
        }

        if (file.Length <= 0 || file.Length > MaxFileSizeBytes)
        {
            throw new BadRequestException("File size is invalid or exceeds the 5MB limit.");
        }

        var extension = Path.GetExtension(file.FileName);
        if (string.IsNullOrWhiteSpace(extension) || !AllowedExtensions.Contains(extension))
        {
            throw new BadRequestException("Unsupported file type. Allowed: .jpg, .jpeg, .png, .webp.");
        }

        if (!file.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
        {
            throw new BadRequestException("Invalid content type. Image content is required.");
        }

        var uniqueName = $"{Guid.NewGuid():N}{extension.ToLowerInvariant()}";
        var fullPath = Path.Combine(_uploadPath, uniqueName);

        await File.WriteAllBytesAsync(fullPath, file.Content, cancellationToken);

        return $"/{UploadFolder.Replace("\\", "/")}/{uniqueName}";
    }

    public Task DeleteAsync(string imageUrl, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(imageUrl))
        {
            return Task.CompletedTask;
        }

        var sanitized = imageUrl.Trim();
        string uriPath;
        if (sanitized.StartsWith("http", StringComparison.OrdinalIgnoreCase))
        {
            if (!Uri.TryCreate(sanitized, UriKind.Absolute, out var uri))
            {
                return Task.CompletedTask;
            }

            uriPath = uri.AbsolutePath;
        }
        else
        {
            uriPath = sanitized;
        }

        var relativePath = uriPath.TrimStart('/')
            .Replace('/', Path.DirectorySeparatorChar);
        var fullPath = Path.GetFullPath(Path.Combine(_webRootPath, relativePath));

        if (!fullPath.StartsWith(_uploadPathFull, StringComparison.OrdinalIgnoreCase))
        {
            return Task.CompletedTask;
        }

        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
        }

        return Task.CompletedTask;
    }
}
