import { useEffect, useState } from "react";
import AccountListShell from "../components/AccountListShell";
import LoadingScreen from "../components/LoadingScreen";
import SegmentedFilter from "../components/SegmentedFilter";
import {
  acceptEndMentorship,
  getMentorRequests,
  updateMentorshipRequest,
} from "../api";

import verifiedIcon from "../assets/verified.png";
import pendingIcon from "../assets/pending.png";
import rejectedIcon from "../assets/rejected.png";
import tickIcon from "../assets/tick.png";

export default function MentorRequests() {
  const token = localStorage.getItem("token");

  const [requests, setRequests] = useState([]);
  const [requestFilter, setRequestFilter] = useState("mentorship");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const loadRequests = async () => {
    try {
      setLoading(true);
      setErr("");
      const data = await getMentorRequests(token);
      setRequests(data);
    } catch (e) {
      setErr(e.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [token]);

  const handleStatusUpdate = async (id, status) => {
    try {
      setActionLoadingId(id);
      await updateMentorshipRequest(token, id, status);
      await loadRequests();
    } catch (e) {
      setErr(e.message || "Failed to update request");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleAcceptEnd = async (id) => {
    try {
      setActionLoadingId(id);
      await acceptEndMentorship(token, id);
      await loadRequests();
    } catch (e) {
      setErr(e.message || "Failed to end mentorship");
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredRequests = requests.filter((request) =>
    requestFilter === "end"
      ? isEndRequest(request.status)
      : !isEndRequest(request.status)
  );
  const filterOptions = [
    {
      label: "Mentorship requests",
      value: "mentorship",
      count: requests.filter((request) => !isEndRequest(request.status)).length,
    },
    {
      label: "End requests",
      value: "end",
      count: requests.filter((request) => isEndRequest(request.status)).length,
    },
  ];

  return (
    <AccountListShell>
      {err && <div className="accountListError">{err}</div>}

      {loading ? (
        <LoadingScreen text="Loading requests..." />
      ) : requests.length === 0 ? (
        <div className="accountListState">No requests received yet.</div>
      ) : (
        <>
          <div className="accountListToolbar">
            <SegmentedFilter
              label="Filter received requests"
              value={requestFilter}
              options={filterOptions}
              onChange={setRequestFilter}
            />
          </div>
          {filteredRequests.length === 0 ? (
            <div className="accountListState">No requests match this filter.</div>
          ) : (
            <div className="accountTableWrap">
              <table className="accountTable">
                <thead>
                  <tr>
                    <th style={{ width: "30%" }}>Student</th>
                    <th style={{ width: "18%" }}>Sent</th>
                    <th style={{ width: "28%" }}>Message</th>
                    <th style={{ width: "12%" }}>Status</th>
                    <th className="tableActionHeader" style={{ width: "12%" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request) => (
                    <tr key={request.id}>
                      <td>
                        <div className="tablePerson">
                          {request.student_avatar_url ? (
                            <img
                              src={request.student_avatar_url}
                              alt={request.student_full_name || "Student"}
                              className="tableAvatar"
                            />
                          ) : (
                            <div className="tableAvatar">
                              {request.student_full_name?.slice(0, 1)?.toUpperCase() || "S"}
                            </div>
                          )}
                          <div>
                            <div className="tableName">
                              <span>{request.student_full_name || "Student"}</span>
                              <img
                                src={getStatusIcon(request.student_verification_status)}
                                alt={request.student_verification_status || "pending"}
                                className="tableStatusIcon"
                              />
                            </div>
                            <div className="tableMeta">
                              {request.student_department || "-"} / Batch {request.student_batch || "-"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>{formatDateTime(getSentDate(request))}</td>
                      <td>
                        <div className="tableMessage">
                          {request.status === "ending_requested"
                            ? request.end_reason || "-"
                            : request.message || "-"}
                        </div>
                      </td>
                      <td>
                        <span className={`accountPill ${normalizeStatus(request.status)}`}>
                          {getStatusLabel(request.status)}
                        </span>
                      </td>
                      <td className="tableActionCell">
                        <div className="tableActions">
                          {request.status === "pending" && (
                            <>
                              <button
                                className="accountIconButton labeled accept"
                                type="button"
                                title="Confirm"
                                aria-label={`Confirm ${request.student_full_name || "student"}`}
                                onClick={() => handleStatusUpdate(request.id, "accepted")}
                                disabled={actionLoadingId === request.id}
                              >
                                <img src={tickIcon} alt="" />
                                <span>Confirm</span>
                              </button>
                              <button
                                className="accountIconButton labeled reject"
                                type="button"
                                title="Reject"
                                aria-label={`Reject ${request.student_full_name || "student"}`}
                                onClick={() => handleStatusUpdate(request.id, "rejected")}
                                disabled={actionLoadingId === request.id}
                              >
                                <img src={rejectedIcon} alt="" />
                                <span>Reject</span>
                              </button>
                            </>
                          )}
                          {request.status === "ending_requested" && (
                            <button
                              className="accountButton"
                              type="button"
                              onClick={() => handleAcceptEnd(request.id)}
                              disabled={actionLoadingId === request.id}
                            >
                              {actionLoadingId === request.id ? "Ending..." : "Accept End"}
                            </button>
                          )}
                          {!["pending", "ending_requested"].includes(request.status) && (
                            <span className="tableDash">-</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </AccountListShell>
  );
}

function isEndRequest(status = "") {
  return ["ending_requested", "ended"].includes(status);
}

function normalizeStatus(status = "") {
  if (status === "accepted") return "accepted";
  if (status === "rejected") return "rejected";
  if (status === "ended") return "ended";
  if (status === "ending_requested") return "pending";
  return "pending";
}

function getStatusLabel(status = "") {
  if (status === "ending_requested") return "end requested";
  return status || "pending";
}

function getSentDate(request) {
  if (request.status === "ending_requested") return request.end_requested_at;
  if (request.status === "ended") return request.ended_at || request.end_requested_at;
  return request.created_at;
}

function getStatusIcon(status) {
  if (status === "verified") return verifiedIcon;
  if (status === "rejected") return rejectedIcon;
  return pendingIcon;
}

function formatDateTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}
