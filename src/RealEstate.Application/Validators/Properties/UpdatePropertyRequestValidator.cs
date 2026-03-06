using FluentValidation;
using RealEstate.Application.DTOs.Properties;

namespace RealEstate.Application.Validators.Properties;

public class UpdatePropertyRequestValidator : AbstractValidator<UpdatePropertyRequest>
{
    public UpdatePropertyRequestValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).NotEmpty().MaximumLength(4000);
        RuleFor(x => x.Price).GreaterThan(0);
        RuleFor(x => x.CityId).GreaterThan(0);
        RuleFor(x => x.AreaId).GreaterThan(0);
        RuleFor(x => x.Bedrooms).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Bathrooms).GreaterThanOrEqualTo(0);
        RuleFor(x => x.SquareMeters).GreaterThan(0);
        RuleFor(x => x.Address).NotEmpty().MaximumLength(300);
        RuleFor(x => x.PostalCode).MaximumLength(20).When(x => x.PostalCode is not null);
        RuleFor(x => x.PropertyType).IsInEnum();
        RuleFor(x => x.ListingType).IsInEnum();
        RuleFor(x => x.Status).IsInEnum();
        RuleForEach(x => x.ImageUrls).NotEmpty().MaximumLength(500);
        RuleFor(x => x.PrimaryImageUrl).MaximumLength(500).When(x => x.PrimaryImageUrl is not null);
    }
}
