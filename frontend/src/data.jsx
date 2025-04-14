/* My VPS server 
Domain : mtx.proxystream.net
 Site User : proxystream-mtx
 Site User Password : 30hb6QSWnd1iIVI04rUz
 App Port : 5000

Databases
Host: 127.0.0.1 Port: 3306 
Database Name : mtx
Database User Name : mtx
Database User Password : 7Aj6UjD9U4Awy6y9hDHL

*/




/*
User Module Data:

PERMESSIONS LOGIC :
User Groups are like departments or teams (e.g., Administrators, Medical Staff), 
while User Types are roles or permission sets (e.g., Admin, Driver). 
The group_permissions table links which roles are available to each group.

But if a user belongs to a group and has a type, how does that enforce permissions? The user's type must be one allowed by their group. 
For example, if the Medical Staff group can have Drivers and Coordinators, a user in that group can only be assigned those types

having both group_id and type_id in the users table might lead to inconsistencies. If a user's type isn't allowed in their group, that's a problem. 
So there should be validation to ensure the user's type is permitted by their gr

User Types were permissions. So each type has specific access rights. Groups determine which types are available. 
So a user's access is determined by their type, but their group restricts which types they can have

when assigning a user to a group, the available types should be filtered to those allowed by the group. 

The confusion might come from not enforcing that the user's type is within their group's allowed types. 
The database schema alone doesn't enforce this; it needs application logic or composite foreign keys.

-----------


AllUsers : website users "Office workers"

User Type in users table should be linked to user_types and type_name + same for user groups +



Manage Programs : Programs for health care and their types.
Data { Name ,  }


User Settings : it have the Groups and inside it (and check boxes from user types), the user types so it can give each gruop specific permissions using types(permession types)


Suggested updated page names : 
All Users : handels all of the system users
User Types "User Permessions" :  handels users permesions "by creating a type" only.
User Groups "Groups" or we keep it User Groups : handels group creation and their settings. 
user settings "Group Permissions" : handels the group permessions based on (User Types "User Permessions" & "Groups") .


CREATE TABLE group_permissions (
  group_id INT,
  type_id INT,
  PRIMARY KEY (group_id, type_id),
  FOREIGN KEY (group_id) REFERENCES user_groups(group_id),
  FOREIGN KEY (type_id) REFERENCES user_types(type_id)
);

Clinic users OR Add SSN + to User , OR Banned 

Time Sheet :
Tow tasks n the same company each different payment + add how much did the system pay or will pay. 
*/

