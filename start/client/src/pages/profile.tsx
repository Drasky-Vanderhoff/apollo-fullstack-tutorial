import React, { Fragment } from 'react';
import { RouteComponentProps } from '@reach/router';
import { gql, useQuery } from "@apollo/client";

import { Loading, Header, LaunchTile } from "../components";
import { LAUNCH_TILE_DATA } from "./launches";
import * as GetMyTripsTypes from "./__generated__/GetMyTrips";

export const GET_MY_TRIPS = gql`
  query GetMyTrips {
    me {
      id
      email
      trips {
        ...LaunchTile
      }
    }
  }
  ${LAUNCH_TILE_DATA}
`;

interface ProfileProps extends RouteComponentProps {}

const Profile: React.FC<ProfileProps> = () => {
  const { data, loading, error } = useQuery<
    GetMyTripsTypes.GetMyTrips, any
  >(
    GET_MY_TRIPS,
    { fetchPolicy: "network-only"}
  );

  if(loading) return <Loading />;
  if(error) return <p>Error: {error.message}</p>;
  if (data === undefined) return <p>Error: No data available</p>;

  return (
    <Fragment>
      <Header>My Trips</Header>
      {data?.me?.trips?.map((launch: any) => (
        <LaunchTile key={launch.id} launch={launch} />
      )) ?? <p>You haven't booked any trips</p>}
    </Fragment>
  );
}

export default Profile;