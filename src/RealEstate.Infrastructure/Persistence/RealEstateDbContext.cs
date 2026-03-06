using Microsoft.EntityFrameworkCore;

namespace RealEstate.Infrastructure.Persistence;

public class RealEstateDbContext : DbContext
{
    public RealEstateDbContext(DbContextOptions<RealEstateDbContext> options)
        : base(options)
    {
    }
}
