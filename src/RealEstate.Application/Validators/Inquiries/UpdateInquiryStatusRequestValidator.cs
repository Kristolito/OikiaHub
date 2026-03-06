using FluentValidation;
using RealEstate.Application.DTOs.Inquiries;

namespace RealEstate.Application.Validators.Inquiries;

public class UpdateInquiryStatusRequestValidator : AbstractValidator<UpdateInquiryStatusRequest>
{
    public UpdateInquiryStatusRequestValidator()
    {
        RuleFor(x => x.Status).IsInEnum();
    }
}
