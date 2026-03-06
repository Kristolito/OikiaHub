namespace RealEstate.Application.DTOs.PropertyImages;

public class FileUploadData
{
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long Length { get; set; }
    public byte[] Content { get; set; } = Array.Empty<byte>();
}
