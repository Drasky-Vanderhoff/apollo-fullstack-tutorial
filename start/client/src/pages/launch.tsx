import React, { Fragment } from 'react';
import { gql, useQuery } from '@apollo/client';
import { RouteComponentProps } from '@reach/router';

import { Loading, Header, LaunchDetail } from "../components";
import { ActionButton } from "../containers"; 
import { LAUNCH_TILE_DATA } from './launches';
import * as LaunchDetailsTypes from "./__generated__/LaunchDetails";

export const GET_LAUNCH_DETAILS = gql`
  query LaunchDetails ($launchId: ID!) {
    launch(id: $launchId) {
      id
      site
      isBooked
      rocket {
        id
        name
        type
      }
      ...LaunchTile
    }
  }
  ${LAUNCH_TILE_DATA}
`;

interface LaunchProps extends RouteComponentProps {
  launchId?: any;
}

const Launch: React.FC<LaunchProps> = ({ launchId }) => {
  const {
    data,
    loading,
    error
  } = useQuery<
    LaunchDetailsTypes.LaunchDetails,
    LaunchDetailsTypes.LaunchDetailsVariables
  >(
    GET_LAUNCH_DETAILS,
    { variables: { launchId } }  
  );

  if (loading) return <Loading />;
  if (error) return <p>ERROR</p>;

  return (
    <Fragment>
      <Header image={ data?.launch?.mission?.missionPatch }>
        {data?.launch?.mission?.name}
      </Header>
      <LaunchDetail {...data?.launch} />
      <ActionButton {...data?.launch} />
    </Fragment>
  );
}

export default Launch;
