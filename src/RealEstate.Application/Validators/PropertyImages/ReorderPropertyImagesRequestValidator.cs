using FluentValidation;
using RealEstate.Application.DTOs.PropertyImages;

namespace RealEstate.Application.Validators.PropertyImages;

public class ReorderPropertyImagesRequestValidator : AbstractValidator<ReorderPropertyImagesRequest>
{
    public ReorderPropertyImagesRequestValidator()
    {
        RuleFor(x => x.ImageIds)
            .NotNull()
            .Must(x => x.Count > 0)
            .WithMessage("At least one image id is required.");

        RuleForEach(x => x.ImageIds)
            .GreaterThan(0);

        RuleFor(x => x.ImageIds)
            .Must(ids => ids.Distinct().Count() == ids.Count)
            .WithMessage("ImageIds must be unique.");
    }
}
