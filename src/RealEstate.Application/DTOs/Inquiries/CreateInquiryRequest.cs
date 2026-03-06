namespace RealEstate.Application.DTOs.Inquiries;

public class CreateInquiryRequest
{
    public int PropertyId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string Message { get; set; } = string.Empty;
}
