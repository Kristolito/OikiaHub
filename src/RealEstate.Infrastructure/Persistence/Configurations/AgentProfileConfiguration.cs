using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RealEstate.Domain.Entities;

namespace RealEstate.Infrastructure.Persistence.Configurations;

public class AgentProfileConfiguration : IEntityTypeConfiguration<AgentProfile>
{
    public void Configure(EntityTypeBuilder<AgentProfile> builder)
    {
        builder.ToTable("AgentProfiles");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.PhoneNumber)
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(x => x.AgencyName)
            .HasMaxLength(150)
            .IsRequired();

        builder.Property(x => x.Bio)
            .HasMaxLength(2000);

        builder.Property(x => x.ProfileImageUrl)
            .HasMaxLength(500);

        builder.HasIndex(x => x.UserId)
            .IsUnique();

        builder.HasOne(x => x.User)
            .WithOne(x => x.AgentProfile)
            .HasForeignKey<AgentProfile>(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
