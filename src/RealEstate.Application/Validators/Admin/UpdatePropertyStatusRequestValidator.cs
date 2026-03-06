using FluentValidation;
using RealEstate.Application.DTOs.Admin;

namespace RealEstate.Application.Validators.Admin;

public class UpdatePropertyStatusRequestValidator : AbstractValidator<UpdatePropertyStatusRequest>
{
    public UpdatePropertyStatusRequestValidator()
    {
        RuleFor(x => x.Status)
            .IsInEnum()
            .WithMessage("Invalid property status.");
    }
}
