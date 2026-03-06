using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RealEstate.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddInquiryStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "Inquiries",
                type: "int",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.CreateIndex(
                name: "IX_Inquiries_CreatedAt",
                table: "Inquiries",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Inquiries_Status",
                table: "Inquiries",
                column: "Status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Inquiries_CreatedAt",
                table: "Inquiries");

            migrationBuilder.DropIndex(
                name: "IX_Inquiries_Status",
                table: "Inquiries");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Inquiries");
        }
    }
}
