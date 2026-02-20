 
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
 
using System.Data;
 
 
 
using phv03.Models;
 


namespace phv03.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MaterController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        string dbcon;
        DataTable tb;
        SqlDataReader myR;
        SqlConnection myCon;
        SqlCommand myCom;

        public MaterController(IConfiguration configuration)
        {
            _configuration = configuration;
            dbcon = _configuration.GetSection("DBCon").Value;
            myCon = new SqlConnection(dbcon);
        }

        [HttpPost("sp")]
        public ActionResult sp(Mater udata)
        {

            string qu = @""+udata.SysID;

            tb = new DataTable();
            using (myCon)
            {
                myCon.Open();
                using (myCom = new SqlCommand(qu, myCon))
                {
                    myR = myCom.ExecuteReader();
                    tb.Load(myR); myR.Close(); myCon.Close();
                }
            }
            return new OkObjectResult(tb); ;
        }

        

    }
}
