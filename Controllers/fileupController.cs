 
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
 
using System.Data;
 
 
 
using phv03.Models;
 


namespace phv03.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class fileupController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        string dbcon;
        DataTable tb;
        SqlDataReader myR;
        SqlConnection myCon;
        SqlCommand myCom;

        public fileupController(IConfiguration configuration)
        {
            _configuration = configuration;
            dbcon = _configuration.GetSection("DBCon").Value;
            myCon = new SqlConnection(dbcon);
        }

        [HttpPost, Route("UploadImage")]
        public Response UploadImage([FromForm] FileModel fileModel) {

            Response response = new Response();
            try {
                string path = Path.Combine(@"wwwroot/img/", fileModel.FileName);
                using (Stream stream = new FileStream(path, FileMode.Create)) {
                    fileModel.file.CopyTo(stream);
                }
                response.StatusCode = 200;
                response.ErrorMessae = "Done";
            
            } catch (Exception ex) {
                response.StatusCode = 100;
                response.ErrorMessae = ex.Message;
            }
            return response;
        }
        //[HttpPost("sp")]
        //public ActionResult sp(fileup udata)
        //{

        //    string qu = @""+udata.SysID;

        //    tb = new DataTable();
        //    using (myCon)
        //    {
        //        myCon.Open();
        //        using (myCom = new SqlCommand(qu, myCon))
        //        {
        //            myR = myCom.ExecuteReader();
        //            tb.Load(myR); myR.Close(); myCon.Close();
        //        }
        //    }
        //    return new OkObjectResult(tb); ;
        //}

        

    }
}
