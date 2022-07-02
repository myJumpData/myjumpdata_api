import crypto from "crypto";
import mongoose from "mongoose";
import Club from "../models/club.model";
import Group from "../models/group.model";
import User from "../models/user.model";
import { requestHandler, requestHandlerError } from "../utils/requestHandler";

export function createGroup(req, res) {
  if (!req.body.name) {
    return requestHandler(res, 400, "missing.field.name", "No name provided!");
  }
  const group = new Group({
    name: req.body.name,
    club: new mongoose.Types.ObjectId(req.body.club),
  });
  group.save((err, group) => {
    if (err) {
      return requestHandlerError(res, err);
    }
    User.find({ _id: req.userId }, (err, coaches) => {
      group.coaches = coaches.map((coach) => coach._id);
      group.save((err) => {
        if (err) {
          return requestHandlerError(res, err);
        }
        return requestHandler(
          res,
          201,
          "success.create.group",
          "Group was created succcessfully!",
          group
        );
      });
    });
  });
}
export function updateGroupName(req, res) {
  Group.findOne({ _id: req.params.id })
    .select("-coaches -athletes -_id -__v")
    .exec((err, group) => {
      if (err) {
        return requestHandlerError(res, err);
      }
      if (req.body.name && group?.name !== req.body.name) {
        Group.updateOne(
          { _id: req.params.id },
          { name: req.body.name.toLowerCase() }
        ).exec((err) => {
          if (err) {
            return requestHandlerError(res, err);
          }
          Group.findOne({ _id: req.params.id })
            .select("-coaches -athletes -_id -__v")
            .exec((err, new_group) => {
              if (err) {
                return requestHandlerError(res, err);
              }
              return requestHandler(
                res,
                200,
                "success.update.group.name",
                "Success updating group name!",
                new_group
              );
            });
        });
      } else {
        return requestHandler(
          res,
          200,
          "success.update.group.name",
          "Success updating group name!",
          group
        );
      }
    });
}
export function getGroup(req, res) {
  Group.findOne({ _id: req.params.id })
    .populate("coaches athletes", "-password -roles -__v")
    .exec((err, group) => {
      if (err) {
        return requestHandlerError(res, err);
      }
      if (group) {
        const athletes = group.athletes?.map((d: any) => {
          let picture: null | string = null;
          if (d.picture === "gravatar") {
            picture = `https://secure.gravatar.com/avatar/${crypto
              .createHash("md5")
              .update(d.email)
              .digest("hex")}?size=300&d=404`;
          }
          return {
            id: d?._id,
            firstname: d?.firstname,
            lastname: d?.lastname,
            username: d?.username,
            picture,
          };
        });
        const coaches = group.coaches?.map((d: any) => {
          let picture: null | string = null;
          if (d.picture === "gravatar") {
            picture = `https://secure.gravatar.com/avatar/${crypto
              .createHash("md5")
              .update(d?.email)
              .digest("hex")}?size=300&d=404`;
          }
          return {
            id: d?._id,
            firstname: d?.firstname,
            lastname: d?.lastname,
            username: d?.username,
            picture,
          };
        });
        return requestHandler(res, 200, "", "", {
          name: group.name,
          _id: group._id,
          athletes,
          coaches,
        });
      } else {
        return requestHandler(res, 404, "", "");
      }
    });
}
export function getGroups(req, res) {
  Club.findOne({
    $or: [{ coaches: { $in: req.userId } }, { athletes: { $in: req.userId } }],
  }).exec((err, club: any) => {
    if (err) {
      return requestHandlerError(res, err);
    }
    if (!club) {
      return requestHandler(res, 200, "", "", []);
    }
    Group.find({
      club: { $in: club._id },
      $or: [
        { coaches: { $in: req.userId } },
        { athletes: { $in: req.userId } },
      ],
    })
      .populate("coaches athletes", "-password")
      .exec((err, groups) => {
        if (err) {
          return requestHandlerError(res, err);
        }
        return requestHandler(res, 200, "", "", groups);
      });
  });
}

export function addAthletesToGroup(req, res) {
  User.find({ _id: req.body.users }, (err, users) => {
    if (err) {
      return requestHandlerError(res, err);
    }
    Group.updateOne(
      { _id: req.params.id },
      { $addToSet: { athletes: users.map((user) => user._id) } },
      (err) => {
        if (err) {
          return requestHandlerError(res, err);
        }
        return requestHandler(
          res,
          200,
          "success.group.athletes.update",
          "Group Athletes have been updated successfully!"
        );
      }
    );
  });
}
export function removeAthletesFromGroup(req, res) {
  User.find({ _id: req.body.users }, (err, users) => {
    if (err) {
      return requestHandlerError(res, err);
    }
    Group.updateOne(
      { _id: req.params.id },
      { $pullAll: { athletes: users.map((user) => user._id) } },
      (err) => {
        if (err) {
          return requestHandlerError(res, err);
        }
        return requestHandler(
          res,
          200,
          "success.group.athletes.update",
          "Group Athletes have been updated successfully!"
        );
      }
    );
  });
}
export function addCoachesToGroup(req, res) {
  User.find({ _id: req.body.coach }, (err, users) => {
    if (err) {
      return requestHandlerError(res, err);
    }
    Group.updateOne(
      { _id: req.params.id },
      { $addToSet: { coaches: users.map((user) => user._id) } },
      (err) => {
        if (err) {
          return requestHandlerError(res, err);
        }
        return requestHandler(
          res,
          200,
          "success.group.coaches.update",
          "Group Coaches have been updated successfully!"
        );
      }
    );
  });
}
export function removeCoachesFromGroup(req, res) {
  User.find({ _id: req.body.coach }, (err, users) => {
    if (err) {
      return requestHandlerError(res, err);
    }
    Group.updateOne(
      { _id: req.params.id },
      { $pullAll: { coaches: users.map((user) => user._id) } },
      (err) => {
        if (err) {
          return requestHandlerError(res, err);
        }
        return requestHandler(
          res,
          200,
          "success.group.coaches.update",
          "Group Coaches have been updated successfully!"
        );
      }
    );
  });
}

export function deleteGroup(req, res) {
  Group.deleteOne({ _id: req.params.id }).exec((err) => {
    if (err) {
      return requestHandlerError(res, err);
    }
    return requestHandler(
      res,
      200,
      "success.group.delete",
      "Deleted Group Successfully"
    );
  });
}

export function leaveGroup(req, res) {
  Group.findOne({ _id: req.params.id }).exec((err, group) => {
    if (err) {
      return requestHandlerError(res, err);
    }
    if (group) {
      if (group.coaches?.includes(req.userId)) {
        Group.updateOne(
          { _id: req.params.id },
          { $pull: { coaches: req.userId } },
          (err) => {
            if (err) {
              return requestHandlerError(res, err);
            }
            return requestHandler(
              res,
              200,
              "success.group.coach.leave",
              "Coach has left the group successfully!"
            );
          }
        );
      } else if (group.athletes?.includes(req.userId)) {
        Group.updateOne(
          { _id: req.params.id },
          { $pull: { athletes: req.userId } },
          (err) => {
            if (err) {
              return requestHandlerError(res, err);
            }
            return requestHandler(
              res,
              200,
              "success.group.athlete.leave",
              "Athlete has left the group successfully!"
            );
          }
        );
      }
    }
  });
}
