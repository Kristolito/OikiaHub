using RealEstate.Domain.Enums;

namespace RealEstate.Application.DTOs.Admin;

public class UpdatePropertyStatusRequest
{
    public PropertyStatus Status { get; set; }
}
