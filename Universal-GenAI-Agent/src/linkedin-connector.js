const linkedIn = require('linkedin-jobs-api');

/*
# Query Parameters
|    Parameter    | LinkedIn Default value |                                                Description                                                |
| :-------------: | :--------------------: | :-------------------------------------------------------------------------------------------------------: |
|     keyword     |           ""           |                         _string_ - The text to search: (i.e. Software Developer)                          |
|    location     |           ""           |                            _string_ - The name of the city: (i.e. Los Angeles)                            |
| dateSincePosted |           ""           |                      _string_ - Max range of jobs: `past month`, `past week`, `24hr`                      |
|     jobType     |           ""           | _string_ - Type of position: `full time`, `part time`, `contract`, `temporary`, `volunteer`, `internship` |
|  remoteFilter   |           ""           |                      _string_ - Filter telecommuting: `on site`, `remote`, `hybrid`                       |
|     salary      |           ""           |                 _string_ - Minimum Salary: `40000`, `60000`, `80000`, `100000`, `120000`                  |
| experienceLevel |           ""           |          _string_ - `internship`, `entry level`, `associate`, `senior`, `director`, `executive`           |
|      limit      |           ""           |                     _string_ - Number of jobs returned: (i.e. '1', '10', '100', etc)                      |
|     sortBy      |           ""           |                                      _string_ - `recent`, `relevant`                                      |
|     page        |           "0"          |                                      _string_ - `0`, `1`, `2` ....                                        |

# Job Object
|  Parameter  |     Description (Default: null)     |
| :---------: | :---------------------------------: |
|  position   |      _string_ - Position title      |
|   company   |       _string_ - Company name       |
| companyLogo |       _string_ - Company Logo       |
|  location   |   _string_ - Location of the job    |
|    date     | _string_ - Date the job was posted  |
|   agoTime   | _string_ - time since it was posted |
|   salary    |       _string_ - Salary range       |
|   jobUrl    |   _string_ - URL of the job page    |
*/

function linkedin_query(options = {}) {
    const defaultOptions = {
        keyword: '',
        location: '',
        dateSincePosted: '',
        jobType: '',
        remoteFilter: '',
        salary: '',
        experienceLevel: '',
        limit: '',
        page: '0',
    };

    const queryOptions = { ...defaultOptions, ...options };

    return linkedIn.query(queryOptions).then(response => {
        return response;
    });
}

module.exports = {
    linkedin_query
};