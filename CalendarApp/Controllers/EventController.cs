using CalendarApp.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;


namespace CalendarApp.Controllers 
{
    public class EventController : ApiController
    {
        ApplicationDbContext dc = new ApplicationDbContext();
       
        // POST: api/Event
        [HttpPost]
        public void SaveEvent([FromBody]Events evt)
        {
            dc.Eventss.Add(evt);
            dc.SaveChanges();
        }

        [HttpPost]
        // PUT: api/Event/5
        public void EditEvent(int id, [FromBody]Events evt)
        {
            if (id == evt.Id)
            {
            dc.Entry(evt).State = EntityState.Modified;
            dc.SaveChanges();
            }
        }

        // DELETE: api/Event/5
        [HttpPost]
        public async Task<IHttpActionResult> DeleteEvent(int id)
        {
            Events evt = await dc.Eventss.FindAsync(id);
            if (evt == null)
            {
                return NotFound();
            }

            dc.Eventss.Remove(evt);
            await dc.SaveChangesAsync();

            return Ok(evt);
        }
    }
}
