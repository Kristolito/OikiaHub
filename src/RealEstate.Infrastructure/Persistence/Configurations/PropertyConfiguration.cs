using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RealEstate.Domain.Entities;
using RealEstate.Domain.Enums;

namespace RealEstate.Infrastructure.Persistence.Configurations;

public class PropertyConfiguration : IEntityTypeConfiguration<Property>
{
    public void Configure(EntityTypeBuilder<Property> builder)
    {
        builder.ToTable("Properties");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Title)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(x => x.Description)
            .HasMaxLength(4000)
            .IsRequired();

        builder.Property(x => x.Price)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.SquareMeters)
            .HasPrecision(10, 2)
            .IsRequired();

        builder.Property(x => x.Address)
            .HasMaxLength(300)
            .IsRequired();

        builder.Property(x => x.PostalCode)
            .HasMaxLength(20);

        builder.Property(x => x.Latitude)
            .HasPrecision(9, 6);

        builder.Property(x => x.Longitude)
            .HasPrecision(9, 6);

        builder.Property(x => x.Status)
            .HasDefaultValue(PropertyStatus.Draft)
            .IsRequired();

        builder.Property(x => x.CreatedAt)
            .HasDefaultValueSql("CURRENT_TIMESTAMP(6)")
            .IsRequired();

        builder.Property(x => x.UpdatedAt)
            .HasDefaultValueSql("CURRENT_TIMESTAMP(6)")
            .IsRequired();

        builder.HasIndex(x => x.Price);
        builder.HasIndex(x => x.CityId);
        builder.HasIndex(x => x.AreaId);
        builder.HasIndex(x => x.ListingType);
        builder.HasIndex(x => x.PropertyType);

        builder.HasOne(x => x.City)
            .WithMany(x => x.Properties)
            .HasForeignKey(x => x.CityId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Area)
            .WithMany(x => x.Properties)
            .HasForeignKey(x => x.AreaId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.AgentProfile)
            .WithMany(x => x.Properties)
            .HasForeignKey(x => x.AgentProfileId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
