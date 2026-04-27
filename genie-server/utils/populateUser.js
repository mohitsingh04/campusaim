import RegularUser from "../models/RegularUser.js";

export const populateUser = (path, select = "name email role") => ({
    path,
    model: RegularUser,
    select
});