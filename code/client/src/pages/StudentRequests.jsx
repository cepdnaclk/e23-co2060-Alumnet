import { useEffect, useState } from "react";
import AccountListShell from "../components/AccountListShell";
import LoadingScreen from "../components/LoadingScreen";
import SegmentedFilter from "../components/SegmentedFilter";
import { getStudentRequests } from "../api";
import verifiedIcon from "../assets/verified.png";
import pendingIcon from "../assets/pending.png";
import rejectedIcon from "../assets/rejected.png";

export default function StudentRequests() {
  const token = localStorage.getItem("token");

  const [requests, setRequests] = useState([]);
  const [requestFilter, setRequestFilter] = useState("mentorship");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setErr("");
        const data = await getStudentRequests(token);
        setRequests(data);
      } catch (e) {
        setErr(e.message || "Failed to load requests");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token]);

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
        <div className="accountListState">No requests sent yet.</div>
      ) : (
        <>
          <div className="accountListToolbar">
            <SegmentedFilter
              label="Filter sent requests"
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
                    <th style={{ width: "30%" }}>Mentor</th>
                    <th style={{ width: "18%" }}>Sent</th>
                    <th style={{ width: "34%" }}>Message</th>
                    <th className="tableActionHeader" style={{ width: "18%" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request) => (
                    <tr key={request.id}>
                      <td>
                        <div className="tablePerson">
                          {request.alumni_avatar_url ? (
                            <img
                              src={request.alumni_avatar_url}
                              alt={request.alumni_full_name || "Mentor"}
                              className="tableAvatar"
                            />
                          ) : (
                            <div className="tableAvatar">
                              {request.alumni_full_name?.slice(0, 1)?.toUpperCase() || "M"}
                            </div>
                          )}
                          <div>
                            <div className="tableName">
                              <span>{request.alumni_full_name || "Mentor"}</span>
                              <img
                                src={getStatusIcon(request.alumni_verification_status)}
                                alt={request.alumni_verification_status || "pending"}
                                className="tableStatusIcon"
                              />
                            </div>
                            <div className="tableMeta">
                              {formatRole(request.alumni_job_title, request.alumni_organization)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>{formatDateTime(getSentDate(request))}</td>
                      <td>
                        <div className="tableMessage">
                          {isEndRequest(request.status)
                            ? request.end_reason || "-"
                            : request.message || "-"}
                        </div>
                      </td>
                      <td className="tableActionCell">
                        <div className="tableActions">
                          <span className={`accountPill ${normalizeStatus(request.status)}`}>
                            {getStatusLabel(request.status)}
                          </span>
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

function formatRole(title, organization) {
  if (title && organization) return `${title} at ${organization}`;
  return title || organization || "Mentor";
}

function formatDateTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}
