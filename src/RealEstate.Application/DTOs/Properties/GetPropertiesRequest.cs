namespace RealEstate.Application.DTOs.Properties;

public class GetPropertiesRequest
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string SortBy { get; set; } = "newest";
}
