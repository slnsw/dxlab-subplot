import React from 'react'
import Modal from '@material-ui/core/Modal'
import Backdrop from '@material-ui/core/Backdrop'
import Fade from '@material-ui/core/Fade'
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined'
import HighlightOffIcon from '@material-ui/icons/HighlightOff'
import Grid from '@material-ui/core/Grid'
import Link from '@material-ui/core/Link'

import styles from './About.module.scss'

// const useStyles = makeStyles((theme) => ({
//   modal: {
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center'
//   },
//   paper: {
//     backgroundColor: theme.palette.background.paper,
//     border: '2px solid #000',
//     boxShadow: theme.shadows[5],
//     padding: theme.spacing(2, 4, 3)
//   }
// }))

export const About = () => {
  const [open, setOpen] = React.useState(false)

  const handleOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <>

      <Link
        component='a'
        variant='body2'
        onClick={handleOpen}
        className={styles.btnAbout}
      >
        <InfoOutlinedIcon />
      </Link>
      <Modal
        aria-labelledby='transition-modal-title'
        aria-describedby='transition-modal-description'
        className={styles.modal}
        classes={{
          // root: styles.root

        }}
        open={open}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        disableAutoFocus
        BackdropProps={{
          timeout: 500
        }}
      >
        <Fade in={open}>
          <Grid
            container
            className={styles.container}
            direction='row'
            justify='center'
            alignItems='center'
          >
            <Grid item xs={8} className={styles.content}>

              <span className={styles.close}><HighlightOffIcon /></span>

              <h2>Subplot</h2>

              <p>SubPlot is the latest DX Lab experiment and uses a significant collection of <a href='https://www.sl.nsw.gov.au/research-and-collections/significant-collections/subdivision-plans' target='_blank' rel='noopener'>subdivision plans</a>, also known as estate maps that are part of the Library's extensive map collection. The Library has acquired over 40,000 of these ephemeral advertising posters. Mostly produced from the 1860s to the 1930s, these popular posters advertised new subdivisions and the sale of land.</p>

              <p>They were originally produced by real estate agents to promote the merits of newly created estates and subdivisions.  Printed in both colour and black &amp; white, these advertising materials illustrate the early development of the real estate industry in Australia, highlight changes in the way land was subdivided, streets were named and properties were valued and reflect the spread of suburbs across Sydney and regional areas. Subdivision plans were fleeting items, not meant to last beyond the land auction and many would have been discarded by real estate agencies once a property was sold.</p>

              <p>Users can explore the collection in a three-dimensional interface with plans cropped and positioned over a modern-day map of where they represent. Clicking on a plan presents the user with a zoomable maximum resolution version. It is possible to filter the plans by year and search for items related to a particular location.</p>

              <p>This particular data set has not been experimented with before and our aim has been to research a new way to access these plans in the browser and therefore promote the information contained within them.</p>

            </Grid>
          </Grid>
        </Fade>
      </Modal>

    </>
  )
}
