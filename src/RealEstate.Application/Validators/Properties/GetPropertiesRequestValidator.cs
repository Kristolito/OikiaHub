using FluentValidation;
using RealEstate.Application.DTOs.Properties;

namespace RealEstate.Application.Validators.Properties;

public class GetPropertiesRequestValidator : AbstractValidator<GetPropertiesRequest>
{
    private static readonly string[] AllowedSortValues = ["newest", "oldest", "priceasc", "pricedesc"];

    public GetPropertiesRequestValidator()
    {
        RuleFor(x => x.Page).GreaterThan(0);
        RuleFor(x => x.PageSize).InclusiveBetween(1, 100);

        RuleFor(x => x.MinPrice).GreaterThanOrEqualTo(0).When(x => x.MinPrice.HasValue);
        RuleFor(x => x.MaxPrice).GreaterThanOrEqualTo(0).When(x => x.MaxPrice.HasValue);
        RuleFor(x => x.MaxPrice)
            .GreaterThanOrEqualTo(x => x.MinPrice!.Value)
            .When(x => x.MinPrice.HasValue && x.MaxPrice.HasValue);

        RuleFor(x => x.MinBedrooms).GreaterThanOrEqualTo(0).When(x => x.MinBedrooms.HasValue);
        RuleFor(x => x.MaxBedrooms).GreaterThanOrEqualTo(0).When(x => x.MaxBedrooms.HasValue);
        RuleFor(x => x.MaxBedrooms)
            .GreaterThanOrEqualTo(x => x.MinBedrooms!.Value)
            .When(x => x.MinBedrooms.HasValue && x.MaxBedrooms.HasValue);

        RuleFor(x => x.MinBathrooms).GreaterThanOrEqualTo(0).When(x => x.MinBathrooms.HasValue);
        RuleFor(x => x.MaxBathrooms).GreaterThanOrEqualTo(0).When(x => x.MaxBathrooms.HasValue);
        RuleFor(x => x.MaxBathrooms)
            .GreaterThanOrEqualTo(x => x.MinBathrooms!.Value)
            .When(x => x.MinBathrooms.HasValue && x.MaxBathrooms.HasValue);

        RuleFor(x => x.MinSquareMeters).GreaterThanOrEqualTo(0).When(x => x.MinSquareMeters.HasValue);
        RuleFor(x => x.MaxSquareMeters).GreaterThanOrEqualTo(0).When(x => x.MaxSquareMeters.HasValue);
        RuleFor(x => x.MaxSquareMeters)
            .GreaterThanOrEqualTo(x => x.MinSquareMeters!.Value)
            .When(x => x.MinSquareMeters.HasValue && x.MaxSquareMeters.HasValue);

        RuleFor(x => x.MaxLatitude)
            .GreaterThanOrEqualTo(x => x.MinLatitude!.Value)
            .When(x => x.MinLatitude.HasValue && x.MaxLatitude.HasValue);

        RuleFor(x => x.MaxLongitude)
            .GreaterThanOrEqualTo(x => x.MinLongitude!.Value)
            .When(x => x.MinLongitude.HasValue && x.MaxLongitude.HasValue);

        RuleFor(x => x.SortBy)
            .Must(value => AllowedSortValues.Contains((value ?? "newest").Trim().ToLowerInvariant()))
            .WithMessage("SortBy must be one of: newest, oldest, priceAsc, priceDesc.");

        RuleFor(x => x.ListingType).IsInEnum().When(x => x.ListingType.HasValue);
        RuleFor(x => x.PropertyType).IsInEnum().When(x => x.PropertyType.HasValue);
        RuleFor(x => x.Status).IsInEnum().When(x => x.Status.HasValue);
    }
}
