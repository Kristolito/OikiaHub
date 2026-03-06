using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RealEstate.Domain.Entities;

namespace RealEstate.Infrastructure.Persistence.Configurations;

public class AmenityConfiguration : IEntityTypeConfiguration<Amenity>
{
    public void Configure(EntityTypeBuilder<Amenity> builder)
    {
        builder.ToTable("Amenities");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name)
            .HasMaxLength(100)
            .IsRequired();

        builder.HasIndex(x => x.Name)
            .IsUnique();

        builder.HasData(
            new Amenity { Id = 1, Name = "Parking" },
            new Amenity { Id = 2, Name = "Elevator" },
            new Amenity { Id = 3, Name = "Storage Room" },
            new Amenity { Id = 4, Name = "Garden" },
            new Amenity { Id = 5, Name = "Balcony" });
    }
}
