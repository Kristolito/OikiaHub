using Microsoft.EntityFrameworkCore;
using RealEstate.Domain.Entities;

namespace RealEstate.Infrastructure.Persistence;

public class RealEstateDbContext : DbContext
{
    public RealEstateDbContext(DbContextOptions<RealEstateDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<AgentProfile> AgentProfiles => Set<AgentProfile>();
    public DbSet<City> Cities => Set<City>();
    public DbSet<Area> Areas => Set<Area>();
    public DbSet<Amenity> Amenities => Set<Amenity>();
    public DbSet<Property> Properties => Set<Property>();
    public DbSet<PropertyImage> PropertyImages => Set<PropertyImage>();
    public DbSet<Favorite> Favorites => Set<Favorite>();
    public DbSet<Inquiry> Inquiries => Set<Inquiry>();
    public DbSet<PropertyAmenity> PropertyAmenities => Set<PropertyAmenity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(RealEstateDbContext).Assembly);
    }

    public override int SaveChanges()
    {
        ApplyUtcTimestamps();
        return base.SaveChanges();
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        ApplyUtcTimestamps();
        return base.SaveChangesAsync(cancellationToken);
    }

    private void ApplyUtcTimestamps()
    {
        var utcNow = DateTime.UtcNow;

        foreach (var entry in ChangeTracker.Entries().Where(e => e.State is EntityState.Added or EntityState.Modified))
        {
            var createdAt = entry.Properties.FirstOrDefault(p => p.Metadata.Name == "CreatedAt");
            var updatedAt = entry.Properties.FirstOrDefault(p => p.Metadata.Name == "UpdatedAt");
            var createdValue = createdAt?.CurrentValue;

            if (entry.State == EntityState.Added &&
                createdAt is not null &&
                (createdValue is null || createdValue is DateTime dateTime && dateTime == default))
            {
                createdAt.CurrentValue = utcNow;
            }

            if (updatedAt is not null)
            {
                updatedAt.CurrentValue = utcNow;
            }
        }
    }
}
