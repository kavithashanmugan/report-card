const convertor = require("./csvToJson.js");
const fs = require('fs')

var jsonResult;
var outputFile;
var totalAverage = function (courses) {
  //console.log("parsed..",JSON.parse(this.courses))
  if (courses.length != 0) {
    let totalAvg = courses.reduce(function (acc, d) {
      //   console.log("d ca aa",acc + d.courseAverage)
    
    //  console.log("d ca aa",acc + d.courseAverage)
      return acc + (d.courseAverage||0);
    
    }, 0);

    return (totalAvg / courses.length).toFixed(2);
    //.toFixed(2);
  } else {
    return "no grades mentioned";
  }
};


//input params
var courses;
var students;
var tests;
var marks;
var output = process.argv[6];

//function to get the courses student attend when given student id
//get test ids from marks.csv
function getTestsAttended(student_id,marks){
    return marks.filter(Mark=>Mark.student_id == student_id)
}

function filterCourse(value,tests_attended){
    
    let courseObj={}
    let courseArr = []
    for(i=0;i<tests_attended.length;i++){
        if(tests_attended[i].test_id == value.id){
            courseObj["student_id"] = tests_attended[i].student_id
            courseObj["test_id"] = tests_attended[i].test_id
            courseObj["id"]=value.course_id;
            courseObj["weighted_marks"]=value.weight*tests_attended[i].mark;
            
        }
       
    }
    courseArr.push(courseObj)
    return courseArr
 }

//get course id from test ids from tests.csv
function getCourses(student_id,tests,test_attended){
    return []
    .concat(...tests
    .map(el=>{ return (filterCourse(el,test_attended))})
    ) 
}

   function getCourseAverage(arrayRes){
     var helper = {}
     let arr = arrayRes.reduce(function(r, o) {
      var key = o.id;
      if(!helper[key]) {
        helper[key] = Object.assign({}, o);
        r.push(helper[key]);
      } else {
        helper[key].weighted_marks += o.weighted_marks;
      }
      return r;
    }, []);
    for(i=0;i<arr.length;i++){
      
      arr[i]["courseAverage"] = arr[i]["weighted_marks"]/100;
      delete arr[i]["weighted_marks"];
      delete arr[i]["student_id"];
      delete arr[i]["test_id"];
    }
    return arr
   }

function getCourseDetails(arr1,arr2){
    let merged = [];

    for(let i=0; i<arr1.length; i++) {
      merged.push({
       ...arr1[i], 
       ...(arr2.find((itmInner) => itmInner.id === arr1[i].id))}
      );
    }
    
 return merged.filter(value => Object.keys(value).length !== 0);

}
function getTotalCourse(student_id,courses,tests,marks){
  let  tests_attended = getTestsAttended(student_id,marks)
      
      let gc = getCourses(student_id,tests,tests_attended)
     
      let merged = getCourseDetails(gc,courses)
      //console.log("merged..",merged)
 //delete arr[i]["weighted_marks"];
        let ca = getCourseAverage(merged)

       return ca;

}



function detailStudents(students){
  let stdArr =[]
  
  
  students.forEach((std,i)=>{
    let stdObj = {};
    stdObj["id"]=std.id;
    stdObj["name"]=std.name;
    stdObj["totalAverage"]=Number(totalAverage(getTotalCourse(std.id,courses,tests,marks)))
    stdObj["courses"]=getTotalCourse(std.id,courses,tests,marks)
    
    stdArr.push(stdObj)
  },[])

  return stdArr
}

function writetoJsonFile(jsonResult,outputFile){
 var Objstd = {};
 Objstd["students"]=jsonResult
  fs.writeFile(outputFile,JSON.stringify(Objstd), err => {
    if (err) {
        console.log('Error writing to json file', err)
    } else {
        console.log('Successfully written to json file')
    }
})
}
(async function(){
        
        courses = await convertor.csvToJson(process.argv[2]);
       students = await convertor.csvToJson(process.argv[3]);
       tests = await convertor.csvToJson(process.argv[4]);
       marks = await convertor.csvToJson(process.argv[5]);
       outputFile = (process.argv[6])
       jsonResult = detailStudents(students)
       writetoJsonFile(jsonResult,outputFile)   
})()