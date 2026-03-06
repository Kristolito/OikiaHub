using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RealEstate.Domain.Entities;
using RealEstate.Domain.Enums;

namespace RealEstate.Infrastructure.Persistence.Configurations;

public class InquiryConfiguration : IEntityTypeConfiguration<Inquiry>
{
    public void Configure(EntityTypeBuilder<Inquiry> builder)
    {
        builder.ToTable("Inquiries");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.FullName)
            .HasMaxLength(150)
            .IsRequired();

        builder.Property(x => x.Email)
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(x => x.PhoneNumber)
            .HasMaxLength(30);

        builder.Property(x => x.Message)
            .HasMaxLength(2000)
            .IsRequired();

        builder.Property(x => x.Status)
            .HasDefaultValue(InquiryStatus.New)
            .IsRequired();

        builder.Property(x => x.CreatedAt)
            .HasDefaultValueSql("UTC_TIMESTAMP()")
            .IsRequired();

        builder.HasIndex(x => x.CreatedAt);
        builder.HasIndex(x => x.Status);

        builder.HasOne(x => x.Property)
            .WithMany(x => x.Inquiries)
            .HasForeignKey(x => x.PropertyId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.User)
            .WithMany(x => x.Inquiries)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
