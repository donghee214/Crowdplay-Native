import React, { useContext, useEffect, useState } from 'react'
import SpotifyContext from "../spotify/spotifyContext"
import {
  View,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  TouchableOpacity,
  TouchableWithoutFeedback
} from 'react-native'
import Animated from 'react-native-reanimated'
import { useQuery, useLazyQuery } from '@apollo/react-hooks'

import { GET_ME, GET_ROOM, GET_ROOM_LOCAL } from "../graphql/queries"
import CurrentlyPlaying, { CURRENTLY_PLAYING_HEIGHT } from '../components/VotingRoom/CurrentlyPlaying'
import TopNavbar from '../components/VotingRoom/TopNavbar'
import colors from '../assets/colors'
import SongList from '../components/VotingRoom/SongList'
import BottomSheet from 'reanimated-bottom-sheet'

export const DRAWER_HEADER_HEIGHT = 40
export const BOTTOM_SNAP_POINT = 100
const TOP_SNAP_POINT = CURRENTLY_PLAYING_HEIGHT


const VotingRoom = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [isAdmin, setIsAdmin] = useState<boolean>(false)
  const { token, withRenew, remote, authenticate } = useContext(SpotifyContext)
  const { data: dataRoomId } = useQuery(GET_ROOM_LOCAL)
  const { data: meData } = useQuery(GET_ME, {
    variables: {
      accessToken: token
    },
    fetchPolicy: 'cache-first'
  })

  const fall = new Animated.Value(1)

  const [getRoom, { data: roomData }] = useLazyQuery(GET_ROOM, {
    fetchPolicy: 'no-cache'
  })

  useEffect(() => {
    if (dataRoomId) {
      getRoom({
        variables: {
          id: dataRoomId.roomId
        }
      })
    }
  }, [dataRoomId])

  useEffect(() => {
    if (meData && roomData) {
      setIsAdmin(meData.me.id === roomData.room.admin.id)
    }
  }, [meData, roomData])

  const renderHandler = () => {
    const animatedBar1Rotation = (outputRange: number[]) =>
      Animated.interpolate(fall, {
        inputRange: [0, 1],
        outputRange: outputRange,
        extrapolate: Animated.Extrapolate.CLAMP,
      })

    return (
      <View style={styles.handlerContainer}>
        <Animated.View
          style={[
            styles.handlerBar,
            {
              left: -7.5,
              transform: [
                {
                  rotate: Animated.concat(
                    // @ts-ignore
                    animatedBar1Rotation([0.3, 0]),
                    'rad'
                  ),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.handlerBar,
            {
              right: -7.5,
              transform: [
                {
                  rotate: Animated.concat(
                    // @ts-ignore
                    animatedBar1Rotation([-0.3, 0]),
                    'rad'
                  ),
                },
              ],
            },
          ]}
        />
      </View>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      {/* WORKAROUND FOR SAFEAREAVIEW NOT WORKING WITH BOTTOMSHEET  */}
      <View style={{ height: 44 }} />
      <TopNavbar />
      <CurrentlyPlaying isAdmin={isAdmin} />

      <Animated.View
        style={[StyleSheet.absoluteFillObject, {
          opacity: fall.interpolate({
            inputRange: [-0.2, 1],
            outputRange: [1, 0],
            extrapolate: Animated.Extrapolate.CLAMP
          }),
          backgroundColor: 'black',
        }]}
        pointerEvents="none"
      >
      </Animated.View>
      <BottomSheet
        snapPoints={[TOP_SNAP_POINT, BOTTOM_SNAP_POINT]}
        renderContent={() => <SongList />}
        onOpenEnd={() => setIsOpen(true)}
        onCloseEnd={() => setIsOpen(false)}
        callbackNode={fall}
        initialSnap={1}
        borderRadius={20}
        renderHeader={() => (
          <View style={styles.buttonContainer}>
            <TouchableOpacity>
              {renderHandler()}
            </TouchableOpacity>
          </View>
        )}
      />
    </View>

  )
}

const styles = StyleSheet.create({
  scrollViewContainer: {
    position: 'absolute',
    height: Dimensions.get('window').height
  },
  text: {
    color: colors.lightGreen
  },
  topHeader: {
    display: 'flex',
    paddingHorizontal: 22.5,
    paddingVertical: 27.5
  },
  rotation: {
    transform: [{ rotate: '180deg' }]
  },
  noRotation: {
    transform: [{ rotate: '0deg' }]
  },
  buttonContainer: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    height: DRAWER_HEADER_HEIGHT,
    // backgroundColor: colors.whiteSmoke,
  },
  handlerBar: {
    position: 'absolute',
    backgroundColor: '#D1D1D6',
    top: 5,
    borderRadius: 3,
    height: 5,
    width: 20,
  },
  handlerContainer: {
    position: 'absolute',
    alignSelf: 'center',
    top: 10,
    height: 20,
    width: 20,
  },
})

export default VotingRoom