import React from 'react';
import { Card, Row, Col, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faClock, 
  faLocationArrow, 
  faUser,
  faInfoCircle,
  faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';
import dayjs from 'dayjs';

const TripManagementDetails = ({ trip }) => {
  if (!trip) return null;

  return (
    <div className="trip-details p-3 bg-light border-top">
      <Row>
        <Col md={6}>
          <Card className="mb-3">
            <Card.Header>
              <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
              Trip Information
            </Card.Header>
            <Card.Body>
              <dl className="row mb-0">
                <dt className="col-sm-4">Schedule Type</dt>
                <dd className="col-sm-8">{trip.schedule_type}</dd>
                
                <dt className="col-sm-4">Start Date</dt>
                <dd className="col-sm-8">
                  {dayjs(trip.start_date).format('MMM D, YYYY')}
                </dd>
                
                {trip.end_date && (
                  <>
                    <dt className="col-sm-4">End Date</dt>
                    <dd className="col-sm-8">
                      {dayjs(trip.end_date).format('MMM D, YYYY')}
                    </dd>
                  </>
                )}
                
                {trip.schedule_days && trip.schedule_days.length > 0 && (
                  <>
                    <dt className="col-sm-4">Schedule Days</dt>
                    <dd className="col-sm-8">
                      {trip.schedule_days.join(', ')}
                    </dd>
                  </>
                )}
              </dl>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card className="mb-3">
            <Card.Header>
              <FontAwesomeIcon icon={faUser} className="me-2" />
              Member Details
            </Card.Header>
            <Card.Body>
              <dl className="row mb-0">
                <dt className="col-sm-4">Name</dt>
                <dd className="col-sm-8">
                  {trip.TripMember?.first_name} {trip.TripMember?.last_name}
                </dd>
                
                <dt className="col-sm-4">Program</dt>
                <dd className="col-sm-8">{trip.Program?.name || 'N/A'}</dd>
                
                <dt className="col-sm-4">Company</dt>
                <dd className="col-sm-8">{trip.Company?.name || 'N/A'}</dd>
              </dl>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {trip.legs && trip.legs.length > 0 && (
        <Card>
          <Card.Header>
            <FontAwesomeIcon icon={faLocationArrow} className="me-2" />
            Trip Legs
          </Card.Header>
          <Card.Body className="p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Sequence</th>
                    <th>Pickup</th>
                    <th>Dropoff</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Driver</th>
                  </tr>
                </thead>
                <tbody>
                  {trip.legs.map((leg) => (
                    <tr key={leg.leg_id}>
                      <td>{leg.sequence}</td>
                      <td>{leg.pickup_location}</td>
                      <td>{leg.dropoff_location}</td>
                      <td>
                        <div>
                          <FontAwesomeIcon icon={faClock} className="me-1" />
                          {dayjs(leg.scheduled_pickup).format('h:mm A')}
                        </div>
                        <div className="text-muted">
                          <FontAwesomeIcon icon={faClock} className="me-1" />
                          {dayjs(leg.scheduled_dropoff).format('h:mm A')}
                        </div>
                      </td>
                      <td>
                        <Badge 
                          bg={
                            leg.status === 'Completed' ? 'success' :
                            leg.status === 'In Progress' ? 'primary' :
                            leg.status === 'Cancelled' ? 'danger' :
                            'secondary'
                          }
                        >
                          {leg.status}
                        </Badge>
                      </td>
                      <td>
                        {leg.Driver ? 
                          `${leg.Driver.first_name} ${leg.Driver.last_name}` : 
                          'Unassigned'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default TripManagementDetails; 