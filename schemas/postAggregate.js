module.exports = postArgigate =  [

    {
      "$lookup": {
        "from": "users",
        "localField": "userID",
        "foreignField": "_id",
        "as": "userID"
      }
    },
    {
      "$set": {
        "userID": {
          "$first": "$userID"
        }
      }
    }, //TODO check why it is within array
    
    {
      "$lookup": {
        "from": "comments",
        "localField": "commentsID",
        "foreignField": "_id",
        "as": "commentsID"
      }
    },
    {
      "$lookup": {
        "from": "users",
        "localField": "commentsID.userID",
        "foreignField": "_id",
        "as": "replyAuthors"
      }
    },
    {
      "$project": {
        "userID" : 1,
        "content":1,
        "likes":1,
        'date':1,
        
        "commentsID": {
          "$map": {
            "input": "$commentsID",
            "as": "repObj",
            "in": {
              "$mergeObjects": [
                "$$repObj",
                {
                  "userID": {
                    "$first": {
                      "$filter": {
                        "input": "$replyAuthors",
                        "as": "repA",
                        "cond": {
                          "$eq": [
                            "$$repA._id",
                            "$$repObj.userID"
                          ]
                        }
                      }
                    }
                  }
                }
              ]
            }
          },
          
        }
      }
    },
    {
      '$project':{
        'userID.password':0,
        'userID.__v':0,
         'commentsID.userID.password':0,
         'commentsID.userID.__v':0,
         
      }
     },
    
  ] 


