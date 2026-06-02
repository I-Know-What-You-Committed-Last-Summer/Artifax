using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class UpdateOrderModelWithProductionTracking : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "OrderDateTime",
                table: "Orders",
                newName: "CreatedDateTime");

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "Orders",
                type: "text",
                nullable: false,
                defaultValue: "Queued",
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<bool>(
                name: "OrderExpedite",
                table: "Orders",
                type: "boolean",
                nullable: false,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldType: "boolean");

            migrationBuilder.AddColumn<DateTime>(
                name: "CompletedDateTime",
                table: "Orders",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Quantity",
                table: "Orders",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "StartedDateTime",
                table: "Orders",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TimeElapsed",
                table: "Orders",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "TotalTime",
                table: "Orders",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CompletedDateTime",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "Quantity",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "StartedDateTime",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "TimeElapsed",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "TotalTime",
                table: "Orders");

            migrationBuilder.RenameColumn(
                name: "CreatedDateTime",
                table: "Orders",
                newName: "OrderDateTime");

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "Orders",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text",
                oldDefaultValue: "Queued");

            migrationBuilder.AlterColumn<bool>(
                name: "OrderExpedite",
                table: "Orders",
                type: "boolean",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "boolean",
                oldDefaultValue: false);
        }
    }
}
