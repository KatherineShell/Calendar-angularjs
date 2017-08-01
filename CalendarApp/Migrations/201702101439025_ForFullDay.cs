namespace CalendarApp.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class ForFullDay : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Events", "IsFullDay", c => c.Boolean(nullable: false));
        }
        
        public override void Down()
        {
            DropColumn("dbo.Events", "IsFullDay");
        }
    }
}
