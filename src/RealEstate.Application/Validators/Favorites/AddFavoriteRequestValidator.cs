using FluentValidation;
using RealEstate.Application.DTOs.Favorites;

namespace RealEstate.Application.Validators.Favorites;

public class AddFavoriteRequestValidator : AbstractValidator<AddFavoriteRequest>
{
    public AddFavoriteRequestValidator()
    {
        RuleFor(x => x.PropertyId).GreaterThan(0);
    }
}
