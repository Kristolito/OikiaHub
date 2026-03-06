namespace RealEstate.Application.DTOs.PropertyImages;

public class PropertyImageItemResponse
{
    public int Id { get; set; }
    public int PropertyId { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public bool IsPrimary { get; set; }
    public int SortOrder { get; set; }
}
