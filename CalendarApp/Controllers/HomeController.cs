using CalendarApp.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

using System.Web.Mvc;

namespace CalendarApp.Controllers
{
    public class HomeController : Controller
    {
        ApplicationDbContext dc = new ApplicationDbContext();

        public ActionResult Index()
        {
            ViewBag.Title = "Home Page";

            return View();
        }
       
        public JsonResult GetEvents()
        {
               var v = dc.Eventss.OrderBy(a => a.StartDate).ToList();
                return new JsonResult { Data = v, JsonRequestBehavior = JsonRequestBehavior.AllowGet };
        }
      
    }
}
