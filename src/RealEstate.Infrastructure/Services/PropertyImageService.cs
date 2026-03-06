using FluentValidation;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.DTOs.PropertyImages;
using RealEstate.Application.Exceptions;
using RealEstate.Application.Interfaces;
using RealEstate.Domain.Entities;
using RealEstate.Domain.Enums;
using RealEstate.Infrastructure.Persistence;

namespace RealEstate.Infrastructure.Services;

public class PropertyImageService : IPropertyImageService
{
    private readonly RealEstateDbContext _dbContext;
    private readonly IFileStorageService _fileStorageService;
    private readonly IValidator<ReorderPropertyImagesRequest> _reorderValidator;

    public PropertyImageService(
        RealEstateDbContext dbContext,
        IFileStorageService fileStorageService,
        IValidator<ReorderPropertyImagesRequest> reorderValidator)
    {
        _dbContext = dbContext;
        _fileStorageService = fileStorageService;
        _reorderValidator = reorderValidator;
    }

    public async Task<IReadOnlyList<PropertyImageItemResponse>> UploadAsync(
        int propertyId,
        IReadOnlyList<FileUploadData> files,
        int actorUserId,
        string actorRole,
        CancellationToken cancellationToken = default)
    {
        if (files.Count == 0)
        {
            throw new BadRequestException("At least one image file is required.");
        }

        var property = await _dbContext.Properties
            .Include(x => x.AgentProfile)
            .Include(x => x.PropertyImages)
            .FirstOrDefaultAsync(x => x.Id == propertyId, cancellationToken);

        if (property is null)
        {
            throw new NotFoundException("Property not found.");
        }

        await EnsureCanManageAsync(property, actorUserId, actorRole);

        var currentMaxSort = property.PropertyImages.Count == 0
            ? -1
            : property.PropertyImages.Max(x => x.SortOrder);
        var hasPrimary = property.PropertyImages.Any(x => x.IsPrimary);

        foreach (var file in files)
        {
            currentMaxSort++;
            var imageUrl = await _fileStorageService.SavePropertyImageAsync(file, cancellationToken);
            var shouldBePrimary = !hasPrimary && currentMaxSort == 0;

            property.PropertyImages.Add(new PropertyImage
            {
                ImageUrl = imageUrl,
                IsPrimary = shouldBePrimary,
                SortOrder = currentMaxSort
            });
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
        return Map(property.PropertyImages, propertyId);
    }

    public async Task<IReadOnlyList<PropertyImageItemResponse>> GetByPropertyAsync(
        int propertyId,
        int? actorUserId,
        string? actorRole,
        CancellationToken cancellationToken = default)
    {
        var property = await _dbContext.Properties
            .AsNoTracking()
            .Include(x => x.AgentProfile)
            .Include(x => x.PropertyImages)
            .FirstOrDefaultAsync(x => x.Id == propertyId, cancellationToken);

        if (property is null)
        {
            throw new NotFoundException("Property not found.");
        }

        if (property.Status != PropertyStatus.Published)
        {
            var isAdmin = string.Equals(actorRole, "Admin", StringComparison.OrdinalIgnoreCase);
            var isOwnerAgent = string.Equals(actorRole, "Agent", StringComparison.OrdinalIgnoreCase) &&
                               actorUserId.HasValue &&
                               property.AgentProfile.UserId == actorUserId.Value;
            if (!isAdmin && !isOwnerAgent)
            {
                throw new ForbiddenException("You are not allowed to view images for this property.");
            }
        }

        return Map(property.PropertyImages, propertyId);
    }

    public async Task DeleteAsync(
        int propertyId,
        int imageId,
        int actorUserId,
        string actorRole,
        CancellationToken cancellationToken = default)
    {
        var property = await _dbContext.Properties
            .Include(x => x.AgentProfile)
            .Include(x => x.PropertyImages)
            .FirstOrDefaultAsync(x => x.Id == propertyId, cancellationToken);

        if (property is null)
        {
            throw new NotFoundException("Property not found.");
        }

        await EnsureCanManageAsync(property, actorUserId, actorRole);

        var image = property.PropertyImages.FirstOrDefault(x => x.Id == imageId);
        if (image is null)
        {
            throw new NotFoundException("Image not found.");
        }

        var wasPrimary = image.IsPrimary;
        var imageUrl = image.ImageUrl;

        _dbContext.PropertyImages.Remove(image);

        if (wasPrimary)
        {
            var nextPrimary = property.PropertyImages
                .Where(x => x.Id != imageId)
                .OrderBy(x => x.SortOrder)
                .FirstOrDefault();

            if (nextPrimary is not null)
            {
                nextPrimary.IsPrimary = true;
            }
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
        await _fileStorageService.DeleteAsync(imageUrl, cancellationToken);
    }

    public async Task<IReadOnlyList<PropertyImageItemResponse>> SetPrimaryAsync(
        int propertyId,
        int imageId,
        int actorUserId,
        string actorRole,
        CancellationToken cancellationToken = default)
    {
        var property = await _dbContext.Properties
            .Include(x => x.AgentProfile)
            .Include(x => x.PropertyImages)
            .FirstOrDefaultAsync(x => x.Id == propertyId, cancellationToken);

        if (property is null)
        {
            throw new NotFoundException("Property not found.");
        }

        await EnsureCanManageAsync(property, actorUserId, actorRole);

        var target = property.PropertyImages.FirstOrDefault(x => x.Id == imageId);
        if (target is null)
        {
            throw new NotFoundException("Image not found.");
        }

        foreach (var img in property.PropertyImages)
        {
            img.IsPrimary = img.Id == imageId;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
        return Map(property.PropertyImages, propertyId);
    }

    public async Task<IReadOnlyList<PropertyImageItemResponse>> ReorderAsync(
        int propertyId,
        ReorderPropertyImagesRequest request,
        int actorUserId,
        string actorRole,
        CancellationToken cancellationToken = default)
    {
        await _reorderValidator.ValidateAndThrowAsync(request, cancellationToken);

        var property = await _dbContext.Properties
            .Include(x => x.AgentProfile)
            .Include(x => x.PropertyImages)
            .FirstOrDefaultAsync(x => x.Id == propertyId, cancellationToken);

        if (property is null)
        {
            throw new NotFoundException("Property not found.");
        }

        await EnsureCanManageAsync(property, actorUserId, actorRole);

        var currentIds = property.PropertyImages.Select(x => x.Id).OrderBy(x => x).ToList();
        var requestedIds = request.ImageIds.OrderBy(x => x).ToList();
        if (!currentIds.SequenceEqual(requestedIds))
        {
            throw new BadRequestException("ImageIds must include all existing property image ids exactly once.");
        }

        for (var i = 0; i < request.ImageIds.Count; i++)
        {
            var id = request.ImageIds[i];
            var image = property.PropertyImages.First(x => x.Id == id);
            image.SortOrder = i;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
        return Map(property.PropertyImages, propertyId);
    }

    private static IReadOnlyList<PropertyImageItemResponse> Map(IEnumerable<PropertyImage> images, int propertyId)
    {
        return images
            .OrderByDescending(x => x.IsPrimary)
            .ThenBy(x => x.SortOrder)
            .Select(x => new PropertyImageItemResponse
            {
                Id = x.Id,
                PropertyId = propertyId,
                ImageUrl = x.ImageUrl,
                IsPrimary = x.IsPrimary,
                SortOrder = x.SortOrder
            })
            .ToList();
    }

    private static Task EnsureCanManageAsync(Property property, int actorUserId, string actorRole)
    {
        if (actorRole.Equals("Admin", StringComparison.OrdinalIgnoreCase))
        {
            return Task.CompletedTask;
        }

        if (actorRole.Equals("Agent", StringComparison.OrdinalIgnoreCase) && property.AgentProfile.UserId == actorUserId)
        {
            return Task.CompletedTask;
        }

        throw new ForbiddenException("You are not allowed to manage images for this property.");
    }
}
