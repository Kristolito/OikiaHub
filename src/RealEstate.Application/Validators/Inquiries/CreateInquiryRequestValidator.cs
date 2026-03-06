using FluentValidation;
using RealEstate.Application.DTOs.Inquiries;

namespace RealEstate.Application.Validators.Inquiries;

public class CreateInquiryRequestValidator : AbstractValidator<CreateInquiryRequest>
{
    public CreateInquiryRequestValidator()
    {
        RuleFor(x => x.PropertyId).GreaterThan(0);
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(255);
        RuleFor(x => x.PhoneNumber).MaximumLength(30).When(x => x.PhoneNumber is not null);
        RuleFor(x => x.Message).NotEmpty().MinimumLength(10).MaximumLength(2000);
    }
}
