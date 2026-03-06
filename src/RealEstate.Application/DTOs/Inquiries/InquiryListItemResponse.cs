using RealEstate.Domain.Enums;

namespace RealEstate.Application.DTOs.Inquiries;

public class InquiryListItemResponse
{
    public int Id { get; set; }
    public int PropertyId { get; set; }
    public string PropertyTitle { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string MessagePreview { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public InquiryStatus Status { get; set; }
}
