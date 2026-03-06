using FluentValidation;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.DTOs.Favorites;
using RealEstate.Application.Exceptions;
using RealEstate.Application.Interfaces;
using RealEstate.Domain.Enums;
using RealEstate.Infrastructure.Persistence;

namespace RealEstate.Infrastructure.Services;

public class FavoriteService : IFavoriteService
{
    private readonly RealEstateDbContext _dbContext;
    private readonly IValidator<AddFavoriteRequest> _addValidator;

    public FavoriteService(RealEstateDbContext dbContext, IValidator<AddFavoriteRequest> addValidator)
    {
        _dbContext = dbContext;
        _addValidator = addValidator;
    }

    public async Task<FavoriteStatusResponse> AddAsync(int userId, AddFavoriteRequest request, CancellationToken cancellationToken = default)
    {
        await _addValidator.ValidateAndThrowAsync(request, cancellationToken);

        var property = await _dbContext.Properties
            .AsNoTracking()
            .Where(x => x.Id == request.PropertyId)
            .Select(x => new { x.Id, x.Status })
            .FirstOrDefaultAsync(cancellationToken);

        if (property is null)
        {
            throw new NotFoundException("Property not found.");
        }

        if (property.Status != PropertyStatus.Published)
        {
            throw new BadRequestException("Property is not available for favoriting.");
        }

        var exists = await _dbContext.Favorites
            .AnyAsync(x => x.UserId == userId && x.PropertyId == request.PropertyId, cancellationToken);

        if (!exists)
        {
            _dbContext.Favorites.Add(new Domain.Entities.Favorite
            {
                UserId = userId,
                PropertyId = request.PropertyId
            });

            await _dbContext.SaveChangesAsync(cancellationToken);
        }

        return new FavoriteStatusResponse
        {
            PropertyId = request.PropertyId,
            IsFavorited = true
        };
    }

    public async Task RemoveAsync(int userId, int propertyId, CancellationToken cancellationToken = default)
    {
        if (propertyId <= 0)
        {
            throw new BadRequestException("PropertyId must be greater than zero.");
        }

        var favorite = await _dbContext.Favorites
            .FirstOrDefaultAsync(x => x.UserId == userId && x.PropertyId == propertyId, cancellationToken);

        if (favorite is null)
        {
            return;
        }

        _dbContext.Favorites.Remove(favorite);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<FavoriteItemResponse>> GetMineAsync(int userId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Favorites
            .AsNoTracking()
            .Where(x => x.UserId == userId && x.Property.Status == PropertyStatus.Published)
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new FavoriteItemResponse
            {
                PropertyId = x.PropertyId,
                Title = x.Property.Title,
                Price = x.Property.Price,
                City = x.Property.City.Name,
                Area = x.Property.Area.Name,
                Bedrooms = x.Property.Bedrooms,
                Bathrooms = x.Property.Bathrooms,
                SquareMeters = x.Property.SquareMeters,
                ListingType = x.Property.ListingType,
                PropertyType = x.Property.PropertyType,
                PrimaryImageUrl = x.Property.PropertyImages
                    .OrderByDescending(i => i.IsPrimary)
                    .ThenBy(i => i.SortOrder)
                    .Select(i => i.ImageUrl)
                    .FirstOrDefault(),
                FavoritedAt = x.CreatedAt
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<FavoriteStatusResponse> CheckAsync(int userId, int propertyId, CancellationToken cancellationToken = default)
    {
        if (propertyId <= 0)
        {
            throw new BadRequestException("PropertyId must be greater than zero.");
        }

        var isFavorited = await _dbContext.Favorites
            .AsNoTracking()
            .AnyAsync(x => x.UserId == userId && x.PropertyId == propertyId, cancellationToken);

        return new FavoriteStatusResponse
        {
            PropertyId = propertyId,
            IsFavorited = isFavorited
        };
    }
}
