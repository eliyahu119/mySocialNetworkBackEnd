module.exports = postArgigate =  [
    {
        //lookup for the post likes
        $lookup: {
            from: 'likes',
            localField: '_id',
            foreignField: 'postCommentID',
            as: '_likes'
        },
    },
    //the user wrote the post
    {
       $lookup: {
           from: 'users',
           localField: 'userID',
           foreignField: '_id',
           as: 'user'
       },
   },
   
     {
        $lookup: {
            from: 'comments',
            localField  : 'commentsID',
            foreignField  : '_id',
            as: 'comments'
        },
     },
     //unwind the comments to do a nesting lookup
     {
       $unwind: {
         path: "$comments",
         preserveNullAndEmptyArrays: true
    }
   }, 
   //lookup in the comments likes 
    {
       $lookup: {
           from: 'likes',
           localField  : 'comments._id',
           foreignField  : 'postCommentID',
           as: 'comments._likes'
       },
    },
    //lookup in the user that wrote the comment
    {
       $lookup: {
           from: 'users',
           localField: 'comments.userID',
           foreignField: '_id',
           as: 'comments.user'
       },
   },
     {
        $set: {
           'comments.likes':'$comments._likes.userID',
            'likes': '$_likes.userID'
        }
    }, 
    
    {
        $project: {
          'comments': {
                $map: { input: "$comments", as: "cm", cond: { $ifNull: ["$$cm._id", false] } }
              } , //returns an error
           'comments.userID':0,
           'comments.user.password':0,
           'comments._likes':0,
           'userID':0,
           'user.password':0,
            'commentsID':0,
            '_likes': 0,
             
         }

    },
    {
       
           $group: {
             _id : "$_id",
             user:{$first:'$user'},
             likes:{$first:'$likes'},
             date:{$first:'$date'},
             content:{$first:'$content'},
             comments: { $push: "$comments" },
           }
    }
]