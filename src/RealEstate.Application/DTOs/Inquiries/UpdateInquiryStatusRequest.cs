using RealEstate.Domain.Enums;

namespace RealEstate.Application.DTOs.Inquiries;

public class UpdateInquiryStatusRequest
{
    public InquiryStatus Status { get; set; }
}
