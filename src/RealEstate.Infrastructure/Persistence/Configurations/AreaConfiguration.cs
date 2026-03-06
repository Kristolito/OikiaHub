using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RealEstate.Domain.Entities;

namespace RealEstate.Infrastructure.Persistence.Configurations;

public class AreaConfiguration : IEntityTypeConfiguration<Area>
{
    public void Configure(EntityTypeBuilder<Area> builder)
    {
        builder.ToTable("Areas");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name)
            .HasMaxLength(100)
            .IsRequired();

        builder.HasIndex(x => x.Name);

        builder.HasIndex(x => new { x.CityId, x.Name })
            .IsUnique();

        builder.HasOne(x => x.City)
            .WithMany(x => x.Areas)
            .HasForeignKey(x => x.CityId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasData(
            new Area { Id = 1, Name = "Kifisia", CityId = 1 },
            new Area { Id = 2, Name = "Kolonaki", CityId = 1 },
            new Area { Id = 3, Name = "Kalamaria", CityId = 2 },
            new Area { Id = 4, Name = "Toumba", CityId = 2 },
            new Area { Id = 5, Name = "Rio", CityId = 3 });
    }
}
